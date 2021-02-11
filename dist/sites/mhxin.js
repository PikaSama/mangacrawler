"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“漫画芯”的漫画下载模块
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.manhuaxin = void 0;
const axios_1 = require("axios");
const async = require("async");
const cheerio = require("cheerio");
// 本地模块
const utils_1 = require("../modules/utils");
const yau_1 = require("../modules/yau");
const generator_1 = require("../modules/generator");
const progressBar_1 = require("../modules/progressBar");
let mangaUrl = '';
let savePath = '';
let crawlLimit = 0;
let crawlList = new Map();
let mangaImages = 0;
let dlTime = 0;
function manhuaxin() {
    yau_1.prepare('mhxin', (err, result) => {
        if (err) {
            utils_1.Logger.err(err);
            process.exit(1);
        }
        else {
            ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
            getMangaInfo();
        }
    });
}
exports.manhuaxin = manhuaxin;
function getUrl(params, callback) {
    const { url, page, getInfo } = params;
    axios_1.default
        .get(url, { timeout: 30000 })
        .then(({ data }) => {
        const $ = cheerio.load(data);
        const imgElement = $('img#image');
        const imgUrl = imgElement.attr('src');
        crawlList.set(page, imgUrl);
        if (getInfo) {
            const title = $('[name="keywords"]').attr('content').split(' ')[0];
            const chapter = $('a.BarTit').text().trim();
            mangaImages = parseInt(imgElement.next().text().split('/')[1], 10);
            utils_1.Logger.info(`Title: ${title}`);
            utils_1.Logger.info(`Chapter: ${chapter}`);
            utils_1.Logger.info(`Pictures: ${mangaImages}`);
            utils_1.Logger.info('Resolving images...\n');
        }
        callback(null);
    })
        .catch((err) => callback(err));
}
function getMangaInfo() {
    const timer = new utils_1.OutTimer(40, '0x0002');
    dlTime = new Date().getTime();
    utils_1.Logger.info('Fetching some information...\n');
    // 第一次解析图片地址，获取漫画信息
    getUrl({
        url: mangaUrl,
        page: 1,
        getInfo: 1,
    }, (err) => {
        if (err) {
            utils_1.Logger.newLine(1);
            utils_1.Logger.err(`${err} \n`);
            utils_1.Logger.err('Oops! Something went wrong, try again? [M-0x0001]');
            process.exit(1);
        }
        else {
            timer.clear();
            resolveImages();
        }
    });
}
function resolveImages() {
    const timer = new utils_1.OutTimer(40, '0x0102');
    // 获取图片的进度条
    let resolvedImgs = 1;
    const resolvePB = new progressBar_1.ProgressBar(mangaImages);
    resolvePB.render(resolvedImgs, mangaImages);
    // 获取图片链接(并发控制)
    const resolveUrl = async.queue(getUrl, crawlLimit);
    // 全部成功后触发
    resolveUrl.drain(() => {
        timer.clear();
        resolvePB.clear();
        downloadImages();
    });
    // 推送任务至队列
    for (let i = 2; i <= mangaImages; i += 1) {
        // 错误时，结束进程
        resolveUrl.push({ url: `${mangaUrl.slice(0, mangaUrl.length - 5)}-${i}.html`, page: i }, (err) => {
            if (err) {
                utils_1.Logger.newLine(1);
                utils_1.Logger.err(`${err} \n`);
                utils_1.Logger.err('Oops! Something went wrong, try again? [M-0x0001]');
                process.exit(1);
            }
            else {
                resolvedImgs += 1;
                resolvePB.render(resolvedImgs, mangaImages);
            }
        });
    }
}
function downloadImages() {
    utils_1.Logger.newLine(1);
    utils_1.Logger.info('Downloading manga...\n');
    const timer = new utils_1.OutTimer(40, '0x0202');
    // 下载图片(并发控制)
    const download = async.queue((param, callback) => {
        const { url, page } = param;
        const path = `${savePath}/split/${page}.jpg`;
        utils_1.downloadImg({
            url,
            path,
        }, (err) => {
            if (err) {
                callback(err);
            }
            else {
                callback(null);
            }
        });
    }, crawlLimit);
    download.drain(() => {
        timer.clear();
        downloadPB.clear();
        utils_1.Logger.newLine(1);
        utils_1.Logger.info('Generating HTML format file...\n');
        generator_1.genHTML({
            imgAmount: mangaImages,
            path: savePath,
            dlTime,
        });
    });
    // 下载进度条
    let downloadedImages = 0;
    const downloadPB = new progressBar_1.ProgressBar(mangaImages);
    downloadPB.render(downloadedImages, mangaImages);
    // 推送任务至队列
    for (const urlArray of crawlList.entries()) {
        download.push({ url: urlArray[1], page: urlArray[0] }, (err) => {
            if (err) {
                utils_1.Logger.newLine(1);
                utils_1.Logger.err(`${err} \n`);
                utils_1.Logger.err('Oops! Something went wrong, try again? [M-0x0001]');
                process.exit(1);
            }
            else {
                downloadedImages += 1;
                downloadPB.render(downloadedImages, mangaImages);
            }
        });
    }
}
