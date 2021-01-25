"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“漫画芯”的漫画下载模块
 * License: GPL-3.0
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
let crawlList = [];
let mangaImages = 0;
let dlTime = 0;
function manhuaxin() {
    yau_1.prepare('mhxin', (err, result) => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        getMangaInfo();
    });
}
exports.manhuaxin = manhuaxin;
function getUrl(params, callback) {
    const { url, getPages } = params;
    axios_1.default
        .get(url, { timeout: 6000 })
        .then(({ data }) => {
        const $ = cheerio.load(data);
        const imgElement = $('img#image');
        const imgUrl = imgElement.attr('src');
        crawlList.push(imgUrl);
        if (getPages) {
            mangaImages = parseInt(imgElement.next().text().split('/')[1], 10);
        }
        callback(null);
    })
        .catch((err) => callback(err));
}
function getMangaInfo() {
    const timer = new utils_1.OutTimer(10, '0x0002');
    dlTime = new Date().getTime();
    utils_1.Logger.info('Fetching some information...\n');
    // 第一次解析图片地址，获取漫画页数
    getUrl({
        url: mangaUrl,
        getPages: 1,
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
    const timer = new utils_1.OutTimer(30, '0x0102');
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
    for (let i = 2; i < mangaImages + 1; i += 1) {
        // 错误时，结束进程
        resolveUrl.push({ url: `${mangaUrl.slice(0, mangaUrl.length - 5)}-${i}.html` }, (err) => {
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
    const timer = new utils_1.OutTimer(30, '0x0202');
    // 下载图片(并发控制)
    const download = async.queue((param, callback) => {
        const { url } = param;
        const pic = url.split('/')[url.split('/').length - 1];
        const path = `${savePath}/split/${parseInt(pic, 10) + 1}.jpg`;
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
    crawlList.map((_val, index) => {
        download.push({ url: crawlList[index] }, (err) => {
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
        return '';
    });
}
