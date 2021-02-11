"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“动漫屋”的漫画下载模块
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dongmanwu = void 0;
// import { default as axios } form 'axios';
const axios_1 = require("axios");
const async = require("async");
const cheerio = require("cheerio");
const inquirer = require("inquirer");
// 本地模块
const utils_1 = require("../modules/utils");
const yau_1 = require("../modules/yau");
const generator_1 = require("../modules/generator");
const progressBar_1 = require("../modules/progressBar");
let mangaUrl = '';
let savePath = '';
let crawlLimit = 0;
let crawlList = [];
let mangaInfo = {
    title: '',
    chapter: '',
    pics: 0,
    cid: '',
    mid: '',
    sign: '',
    signdate: '',
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
function dongmanwu() {
    yau_1.prepare('dm5', (err, result) => {
        if (err) {
            utils_1.Logger.err(err);
            process.exit(1);
        }
        else {
            ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
            getMangaInfo((err) => {
                if (err) {
                    utils_1.Logger.err(err);
                    process.exit(1);
                }
                else {
                    resolveImages();
                }
            });
        }
    });
}
exports.dongmanwu = dongmanwu;
function getMangaInfo(callback) {
    dlTime = new Date().getTime();
    utils_1.Logger.info("Fetching manga's information...\n");
    axios_1.default
        .get(mangaUrl)
        .then(({ data }) => {
        const $ = cheerio.load(data);
        let fetchedInfo = 0;
        const infoList = $('head').children('script').last().html().split(';');
        infoList.map((val) => {
            switch (true) {
                case Boolean(val.match('DM5_CTITLE')): {
                    mangaInfo.title = val.split('"')[1];
                    fetchedInfo += 1;
                    break;
                }
                case Boolean(val.match('DM5_IMAGE_COUNT')): {
                    mangaInfo.pics = parseInt(val.split('=')[1], 10);
                    fetchedInfo += 1;
                    break;
                }
                case Boolean(val.match('DM5_CID')): {
                    mangaInfo.cid = val.split('=')[1];
                    fetchedInfo += 1;
                    break;
                }
                case Boolean(val.match('DM5_MID')): {
                    mangaInfo.mid = val.split('=')[1];
                    fetchedInfo += 1;
                    break;
                }
                case Boolean(val.match('DM5_VIEWSIGN=')): {
                    mangaInfo.sign = val.split('"')[1];
                    fetchedInfo += 1;
                    break;
                }
                case Boolean(val.match('DM5_VIEWSIGN_DT')): {
                    mangaInfo.signdate = encodeURIComponent(val.split('"')[1]);
                    fetchedInfo += 1;
                    break;
                }
                default: {
                    // Logger.debug('Passed');
                    break;
                }
            }
            return '';
        });
        mangaInfo.chapter = $('span').eq(1).text().trim();
        if (fetchedInfo === 6) {
            utils_1.Logger.info(`Title: ${mangaInfo.title}`);
            utils_1.Logger.info(`Chapter: ${mangaInfo.chapter}`);
            const mangaTypeElement = $('div#chapterpager');
            if (mangaTypeElement.length > 0) {
                utils_1.Logger.info('Type: A');
            }
            else {
                utils_1.Logger.info('Type: B');
            }
            utils_1.Logger.info(`Pictures: ${mangaInfo.pics}`);
            callback(null);
        }
        else {
            callback('Cannot get enough information.');
        }
    })
        .catch((err) => callback(err));
}
function resolveImages() {
    utils_1.Logger.info('Resolving images...\n');
    const timer = new utils_1.OutTimer(40, '0x0201');
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new progressBar_1.ProgressBar(mangaInfo.pics);
    resolvePB.render(resolvedImgs, mangaInfo.pics);
    // 获取图片链接(并发控制)
    const getPicUrl = async.queue((pic, callback) => {
        let resolveParams = [
            `cid=${mangaInfo.cid}`,
            `page=${pic}`,
            `key=`,
            `language=1`,
            `gtk=6`,
            `_cid=${mangaInfo.cid}`,
            `_mid=${mangaInfo.mid}`,
            `_dt=${mangaInfo.signdate}`,
            `_sign=${mangaInfo.sign}`,
        ].join('&');
        axios_1.default
            .get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, {
            headers: {
                Referer: mangaUrl,
            },
            timeout: 30000,
        })
            .then(({ data }) => {
            let statement = data.split('}');
            statement[4] = statement[4].slice(0, statement[4].length - 1) + " + 'crawlList.push(d[0])'";
            // eslint-disable-next-line no-eval
            eval(statement.join('}'));
            callback(null);
        })
            .catch((err) => callback(err));
    }, crawlLimit);
    // 全部成功后触发
    getPicUrl.drain(() => {
        timer.clear();
        resolvePB.clear();
        utils_1.Logger.newLine(1);
        utils_1.Logger.info('Checking server node list...\n');
        checkNode(crawlList[0]);
    });
    // 推送任务至队列
    for (let i = 0; i < mangaInfo.pics; i += 1) {
        // 错误时，结束进程
        getPicUrl.push(i + 1, (err) => {
            if (err) {
                utils_1.Logger.newLine(1);
                utils_1.Logger.err(`${err} \n`);
                utils_1.Logger.err('Oops! Something went wrong, try again? [M-0x0202]');
                process.exit(1);
            }
            else {
                resolvedImgs += 1;
                resolvePB.render(resolvedImgs, mangaInfo.pics);
            }
        });
    }
}
function checkNode(node) {
    // 获取当前下载节点
    let nodeCopy = node.split('/')[2].split('-');
    nodeCopy.shift();
    const composedNode = nodeCopy.join('-');
    // 与节点列表比对
    let isKnownNode = 0;
    nodeList.map((val) => {
        if (composedNode === val) {
            isKnownNode = 1;
        }
        return '';
    });
    if (isKnownNode) {
        utils_1.Logger.info('The server you are connected to is inclued in the list.\n');
    }
    else {
        utils_1.Logger.warn('You are connected to an unknown server. Report it later?\n');
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
        .then(({ node }) => {
        downloadImages(node);
    })
        .catch((err) => {
        utils_1.Logger.err(`${err} \n`);
        utils_1.Logger.err('Oops! Something went wrong, try again? [M-0x0203]');
        process.exit(1);
    });
}
function downloadImages(node) {
    utils_1.Logger.newLine(1);
    utils_1.Logger.info('Downloading manga...\n');
    const timer = new utils_1.OutTimer(40, '0x0301');
    // 替换节点
    crawlList.map((_val, index) => {
        let url = crawlList[index].split('/');
        url[2] = url[2].split('-')[0] + '-' + node;
        crawlList[index] = url.join('/');
        return '';
    });
    // 下载图片(并发控制)
    const download = async.queue((param, callback) => {
        const { url } = param;
        const picNum = url.split('/')[6].split('_')[0];
        const path = `${savePath}/split/${picNum}.jpg`;
        utils_1.downloadImg({ url, path }, (err) => {
            if (err) {
                callback(err);
            }
            else {
                callback(null);
            }
        }, {
            headers: {
                Referer: mangaUrl,
            },
            timeout: 30000,
        });
    }, crawlLimit);
    // 全部完成时触发
    download.drain(() => {
        timer.clear();
        downloadPB.clear();
        utils_1.Logger.newLine(1);
        utils_1.Logger.info('Generating HTML format file...\n');
        generator_1.genHTML({
            imgAmount: mangaInfo.pics,
            path: savePath,
            dlTime: dlTime,
        });
    });
    // 下载进度条
    let downloadedImgs = 0;
    const downloadPB = new progressBar_1.ProgressBar(mangaInfo.pics);
    downloadPB.render(downloadedImgs, mangaInfo.pics);
    // 推送任务至队列
    crawlList.map((_val, index) => {
        download.push({ url: crawlList[index] }, (err) => {
            if (err) {
                utils_1.Logger.newLine(1);
                utils_1.Logger.err(`${err} \n`);
                utils_1.Logger.err('Oops! Something went wrong, try again? [M-0x0302]');
                process.exit(1);
            }
            else {
                downloadedImgs += 1;
                downloadPB.render(downloadedImgs, mangaInfo.pics);
            }
        });
        return '';
    });
}
