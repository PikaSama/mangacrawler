/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“动漫屋”的漫画下载模块
 * License: GPL-3.0
 */

import axios from 'axios';
import * as async from 'async';
import * as cheerio from 'cheerio';
import * as inquirer from 'inquirer';
import * as puppeteer from 'puppeteer'
import * as chalk from "chalk";
import * as fs from 'fs';

// 本地模块
import {
    WorkerDownloadParam,
    WorkerCallbackFn,
    OutTimer,
    prepare,
    Logger,
} from "../modules/misc";

import { genHTML as generateManga } from "../modules/generator";
import { ProgressBar } from "../modules/progressBar";

// 漫画信息的接口
interface Info {
    cid: string,
    mid: string,
    sign: string,
    signdate: string,
    msg: string,
    pics: number,
}

let mangaUrl: string;
let savePath: string;
let crawlLimit: number;
let crawlList: string[] = [];
let mangaInfo: Info;
let dlTime: number;
// 节点列表
let nodeList: string[] = [
    "112-53-225-216.cdndm5.com",
    "101-69-161-98.cdndm5.com",
    "101-69-161-99.cdndm5.com",
    "61-174-50-98.cdndm5.com",
    "61-174-50-99.cdndm5.com",
    "104-250-139-219.cdnmanhua.net",
    "104-250-150-12.cdnmanhua.net",
];

function dongmanwu(): void {
    prepare("dm5",(err,result): void => {
        if (err) {
            Logger.err(err);
            process.exit(1);
        }
        else {
            ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
            getMangaInfo().catch((err): void => {
                // 发生错误，结束浏览器进程
                Logger.err(`${err} [M-0x0101]\n`);
                process.exit(1);
            });
        }
    });
}

async function getMangaInfo(): Promise<void> {
    dlTime = new Date().getTime();
    Logger.info('Starting browser...\n');
    const browser: puppeteer.Browser = await puppeteer.launch();
    Logger.info('Opening page...\n');
    const page: puppeteer.Page = await browser.newPage();
    await page.goto(mangaUrl,{ waitUntil: 'networkidle2' });
    Logger.info('Fetching some information...\n');
    // 获取漫画信息，用户信息（请求参数）
    const $: cheerio.Root = cheerio.load(await page.content());
    if ($("div.chapterpager").length > 0) {
        mangaInfo.pics = parseInt(
            $("div.chapterpager")
                .eq(0)
                .children("a")
                .last()
                .text()
        );
        mangaInfo.msg = Logger.infoStr(`Manga type: A | Pictures: ${mangaInfo.pics}\n`);
    }
    else {
        mangaInfo.pics = $("img.load-src").length;
        mangaInfo.msg = Logger.infoStr(`Manga type: B | Pictures: ${mangaInfo.pics}\n`);
    }
    mangaInfo = await page.evaluate((pics: number,msg: string): Info => {
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
        }
    },mangaInfo.pics,mangaInfo.msg);
    console.log(mangaInfo.msg);
    await browser.close();
    resolveImages();
}

function resolveImages(): void {
    Logger.info('Resolving images...\n');
    const timer: OutTimer = new OutTimer(30,'0x0201');
    // 获取图片的进度条
    let resolvedImgs: number = 0;
    const resolvePB: ProgressBar = new ProgressBar(undefined,mangaInfo.pics);
    resolvePB.render(resolvedImgs,mangaInfo.pics);
    // 获取图片链接(并发控制)
    const getPicUrl: async.QueueObject<object> = async.queue((obj: { pic: number },callback: WorkerCallbackFn): void => {
        let resolveParams: string = [
            `cid=${mangaInfo.cid}`,
            `page=${obj.pic}`,
            `key=`,
            `language=1`,
            `gtk=6`,
            `_cid=${mangaInfo.cid}`,
            `_mid=${mangaInfo.mid}`,
            `_dt=${encodeURIComponent(mangaInfo.signdate)}`,
            `_sign=${mangaInfo.sign}`,
        ].join("&");

        axios.get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, {
            headers: {
                'Referer': mangaUrl,
            },
            timeout: 10000,
        }).then(({ data }): void => {
                let statement = data.split("}");
                statement[4] = statement[4].slice(0, statement[4].length - 1) + " + 'crawlList.push(d[0])'";
                eval(statement.join("}"));
                callback(null,1);
        }).catch((err): void => callback(err));
    },crawlLimit);

    // 全部成功后触发
    getPicUrl.drain((): void => {
        timer.clear();
        Logger.info('\n\nChecking server node list...\n');
        checkNode(crawlList[0]);
    });

    // 推送任务至队列
    for (let i = 0;i < mangaInfo.pics;i++) {
        // 错误时，结束进程
        getPicUrl.push({ pic: i + 1 },(err: NodeJS.ErrnoException | string | null,num: number): void => {
            if (err) {
                console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0202]`);
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render(resolvedImgs,mangaInfo.pics);
            }
        });
    }
}

function checkNode(node: string): void {
    // 获取当前下载节点
    let nodeCopy = node.split("/")[2].split("-");
    nodeCopy.shift();
    node = nodeCopy.join("-");
    // 与节点列表比对
    let isKnownNode: number = 0;
    for (let i in nodeList) {
        if (nodeList.hasOwnProperty(i)) {
            if ((node as string) === nodeList[i]) {
                isKnownNode = 1;
                break;
            }
        }
    }
    if (isKnownNode) {
        console.log(`${chalk.whiteBright.bgBlue(' Info ')} The server you are connected to is inclued in the list.\n`);
    }
    else {
        console.warn(`${chalk.whiteBright.bgRed(' Warn ')} You are connected to a unknown server. Report it later?\n`);
    }
    inquirer.prompt([
        {
            type: 'list',
            name: 'node',
            message: 'Please select a server to download images.',
            choices: nodeList,
        },
    ]).then(({ node }): void => { downloadImages(node) });
}

function downloadImages(node: string): void {
    console.log(`\n\n${chalk.whiteBright.bgBlue(' Info ')} Downloading manga...\n`);
    const timer: OutTimer = new OutTimer(30,'0x0301');
    // 替换节点
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            let url: string[] = crawlList[i].split("/");
            url[2] = url[2].split("-")[0] + "-" + node;
            crawlList[i] = url.join("/");
        }
    }
    // 下载图片(并发控制)
    const download = async.queue(({ url }: WorkerDownloadParam,callback: WorkerCallbackFn): void => {
        let picNum: string = url.split("/")[6].split("_")[0];
        axios.get(url, {
            headers: {
                'Referer': mangaUrl,
            },
            responseType: 'arraybuffer',
            timeout: 10000,
        }).then(({ data }): void => {
                fs.writeFile(`${savePath}/split/${picNum}.jpg`,data,(err): void => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null,1);
                    }
                });
        }).catch((err): void => callback(err));
    },crawlLimit);
    // 全部完成时触发
    download.drain((): void => {
        timer.clear();
        console.log(`\n\n${chalk.whiteBright.bgBlue(' Info ')} Generating HTML format file...\n`);
        generateManga({
            imgAmount: mangaInfo.pics,
            path: savePath,
            dlTime: dlTime,
        });
    });
    // 下载进度条
    let downloadedImgs: number = 0;
    const downloadPB: ProgressBar = new ProgressBar(undefined,mangaInfo.pics);
    downloadPB.render(downloadedImgs,mangaInfo.pics);
    // 推送任务至队列
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            // 错误时，结束进程
            download.push({ url: crawlList[i] },(err: Error,result: number): void => {
                if (err) {
                    console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                    console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0302]`);
                    process.exit(1);
                }
                else {
                    downloadedImgs += result;
                    downloadPB.render(downloadedImgs,mangaInfo.pics);
                }
            });
        }
    }
}

export { dongmanwu };
