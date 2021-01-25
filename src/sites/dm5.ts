/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“动漫屋”的漫画下载模块
 * License: GPL-3.0
 */

// import { default as axios } form 'axios';
import axios from 'axios';
import * as async from 'async';
import * as cheerio from 'cheerio';
import * as inquirer from 'inquirer';
import * as puppeteer from 'puppeteer';

// 本地模块
import { WorkerDownloadParam, CallbackFn, ResponseData, Logger, OutTimer, prepare, downloadImg } from '../modules/utils';

import { genHTML as generateManga } from '../modules/generator';
import { ProgressBar } from '../modules/progressBar';

// 漫画信息的接口
interface Info {
    cid: string;
    mid: string;
    sign: string;
    signdate: string;
    msg: string;
    pics: number;
}

let mangaUrl = '';
let savePath = '';
let crawlLimit = 0;
let crawlList: string[] = [];
let mangaInfo: Info = {
    cid: '',
    mid: '',
    sign: '',
    signdate: '',
    msg: '',
    pics: 0,
};
let dlTime = 0;
// 节点列表
let nodeList = [
    '112-53-225-216.cdndm5.com',
    '101-69-161-98.cdndm5.com',
    '101-69-161-99.cdndm5.com',
    '61-174-50-98.cdndm5.com',
    '61-174-50-99.cdndm5.com',
    '104-250-139-219.cdnmanhua.net',
    '104-250-150-12.cdnmanhua.net',
];

function dongmanwu(): void {
    prepare('dm5', (err, result): void => {
        if (err) {
            Logger.err(err);
            process.exit(1);
        } else {
            ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
            getMangaInfo().catch((err): void => {
                // 发生错误，结束浏览器进程
                Logger.err(`${err} [M-0x0101]\n`);
                process.exit(1);
            });
        }
    });
}

function getInfo(): void {
    dlTime = new Date().getTime();
    Logger.info("Fetching manga's information...\n");
    axios.get(mangaUrl).then(({ data }: ResponseData): void => {
        const $ = cheerio.load(data);
        const mangaTypeElement = $('div#chapterpager');
        const infoList = $('head').children('script').last().html().split(';');


        Logger.debug(infoList);
        if (mangaTypeElement.length > 0) {
            Logger.info(`Manga type: A | Pictures: ${}`);
        } else {
            Logger.info(`Manga type: B | Pictures: ${}`);
        }
    });
}

async function getMangaInfo(): Promise<void> {
    dlTime = new Date().getTime();
    Logger.info('Starting browser...\n');
    const browser = await puppeteer.launch();
    Logger.info('Opening page...\n');
    const page = await browser.newPage();
    await page.goto(mangaUrl, { waitUntil: 'networkidle2' });
    Logger.info('Fetching some information...\n');
    // 获取漫画信息，用户信息（请求参数）
    const $ = cheerio.load(await page.content());
    const element = $('div.chapterpager');
    if (element.length > 0) {
        mangaInfo.pics = parseInt(element.eq(0).children('a').last().text(), 10);
        mangaInfo.msg = Logger.str.info(`Manga type: A | Pictures: ${mangaInfo.pics}\n`);
    } else {
        mangaInfo.pics = $('img.load-src').length;
        mangaInfo.msg = Logger.str.info(`Manga type: B | Pictures: ${mangaInfo.pics}\n`);
    }

    mangaInfo = await page.evaluate(
        (pics: number, msg: string): Info => {
            return {
                // @ts-ignore
                cid: window.DM5_CID,
                // @ts-ignore
                mid: window.DM5_MID,
                // @ts-ignore
                sign: window.DM5_VIEWSIGN,
                // @ts-ignore
                signdate: window.DM5_VIEWSIGN_DT,
                pics,
                msg,
            };
        },
        mangaInfo.pics,
        mangaInfo.msg,
    );
    console.log(mangaInfo.msg);
    await browser.close();
    resolveImages();
}

function resolveImages(): void {
    Logger.info('Resolving images...\n');
    const timer = new OutTimer(30, '0x0201');
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new ProgressBar(mangaInfo.pics);
    resolvePB.render(resolvedImgs, mangaInfo.pics);
    // 获取图片链接(并发控制)
    const getPicUrl = async.queue((pic: number, callback: CallbackFn): void => {
        let resolveParams: string = [
            `cid=${mangaInfo.cid}`,
            `page=${pic}`,
            `key=`,
            `language=1`,
            `gtk=6`,
            `_cid=${mangaInfo.cid}`,
            `_mid=${mangaInfo.mid}`,
            `_dt=${encodeURIComponent(mangaInfo.signdate)}`,
            `_sign=${mangaInfo.sign}`,
        ].join('&');

        axios
            .get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, {
                headers: {
                    Referer: mangaUrl,
                },
                timeout: 10000,
            })
            .then(({ data }: ResponseData): void => {
                let statement = data.split('}');
                statement[4] = statement[4].slice(0, statement[4].length - 1) + " + 'crawlList.push(d[0])'";
                // eslint-disable-next-line no-eval
                eval(statement.join('}'));
                callback(null);
            })
            .catch((err): void => callback(err));
    }, crawlLimit);

    // 全部成功后触发
    getPicUrl.drain((): void => {
        timer.clear();
        Logger.newLine(1);
        Logger.info('Checking server node list...\n');
        checkNode(crawlList[0]);
    });

    // 推送任务至队列
    for (let i = 0; i < mangaInfo.pics; i += 1) {
        // 错误时，结束进程
        getPicUrl.push(i + 1, (err): void => {
            if (err) {
                Logger.newLine(1);
                Logger.err(`${err} \n`);
                Logger.err('Oops! Something went wrong, try again? [M-0x0202]');
                process.exit(1);
            } else {
                resolvedImgs += 1;
                resolvePB.render(resolvedImgs, mangaInfo.pics);
            }
        });
    }
}

function checkNode(node: string): void {
    // 获取当前下载节点
    let nodeCopy = node.split('/')[2].split('-');
    nodeCopy.shift();
    const composedNode = nodeCopy.join('-');
    // 与节点列表比对
    let isKnownNode = 0;
    nodeList.map((val): string => {
        if (composedNode === val) {
            isKnownNode = 1;
        }
        return '';
    });
    if (isKnownNode) {
        Logger.info('The server you are connected to is inclued in the list.\n');
    } else {
        Logger.warn('You are connected to an unknown server. Report it later?\n');
    }
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'node',
                message: 'Please select a server to download images.',
                choices: nodeList,
            },
        ])
        .then(({ node }): void => {
            downloadImages(node);
        })
        .catch((err): void => {
            Logger.err(`${err} \n`);
            Logger.err('Oops! Something went wrong, try again? [M-0x0203]');
            process.exit(1);
        });
}

function downloadImages(node: string): void {
    Logger.newLine(1);
    Logger.info('Downloading manga...\n');
    const timer = new OutTimer(30, '0x0301');
    // 替换节点
    crawlList.map((_val, index): string => {
        let url = crawlList[index].split('/');
        url[2] = url[2].split('-')[0] + '-' + node;
        crawlList[index] = url.join('/');
        return '';
    });
    // 下载图片(并发控制)
    const download = async.queue((param: WorkerDownloadParam, callback: CallbackFn): void => {
        const { url } = param;
        const picNum = url.split('/')[6].split('_')[0];
        const path = `${savePath}/split/${picNum}.jpg`;
        downloadImg(
            { url, path },
            (err): void => {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            },
            {
                headers: {
                    Referer: mangaUrl,
                },
                timeout: 10000,
            },
        );
    }, crawlLimit);

    // 全部完成时触发
    download.drain((): void => {
        timer.clear();
        Logger.newLine(1);
        Logger.info('Generating HTML format file...\n');
        generateManga({
            imgAmount: mangaInfo.pics,
            path: savePath,
            dlTime: dlTime,
        });
    });
    // 下载进度条
    let downloadedImgs = 0;
    const downloadPB = new ProgressBar(mangaInfo.pics);
    downloadPB.render(downloadedImgs, mangaInfo.pics);
    // 推送任务至队列
    crawlList.map((_val, index): string => {
        download.push({ url: crawlList[index] }, (err): void => {
            if (err) {
                Logger.newLine(1);
                Logger.err(`${err} \n`);
                Logger.err('Oops! Something went wrong, try again? [M-0x0302]');
                process.exit(1);
            } else {
                downloadedImgs += 1;
                downloadPB.render(downloadedImgs, mangaInfo.pics);
            }
        });
        return '';
    });
}

export { dongmanwu };
