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
const chalk = require("chalk");
const fs = require("fs");
// 本地模块
const misc_1 = require("../modules/misc");
const generator_1 = require("../modules/generator");
const progressBar_1 = require("../modules/progressBar");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let mangaImages;
let dlTime;
function manhuaxin() {
    misc_1.prepare("mhxin", (result) => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        getMangaInfo();
    });
}
exports.manhuaxin = manhuaxin;
function getUrl({ url, extra }, callback) {
    extra = extra || '';
    axios_1.default.get(url, { timeout: 6000 })
        .then(({ data }) => {
        const $ = cheerio.load(data);
        let statement = $("div#images").next().html().split("}");
        statement[7] = extra + "let pushFunc = p.split(';').slice(0,5);let url = pushFunc[4].split('\"')[1];pushFunc[3] = pushFunc[3].split('}').slice(0,3).join('}') + '}crawlList.push(getImageUrl(\\'' + url + '\\'))';return pushFunc.slice(0,4).join(';')";
        eval(statement.join("}"));
        callback(null, 1);
    })
        .catch((err) => callback(err));
}
function getMangaInfo() {
    const timer = new misc_1.OutTimer(10, '0x0002');
    dlTime = new Date().getTime();
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Fetching some information...\n`);
    getUrl({
        url: mangaUrl,
        extra: 'let images = p.split(\'<p>\')[1].split(\'</p>\')[0].split(\'/\')[1];mangaImages = parseInt(images);',
    }, (err, num) => {
        if (err) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
            console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0001]`);
            process.exit(1);
        }
        else {
            timer.clear();
            resolveImages();
        }
    });
}
function resolveImages() {
    const timer = new misc_1.OutTimer(30, '0x0102');
    // 获取图片的进度条
    let resolvedImgs = 1;
    const resolvePB = new progressBar_1.ProgressBar(undefined, mangaImages);
    resolvePB.render(resolvedImgs, mangaImages);
    // 获取图片链接(并发控制)
    const resolveUrl = async.queue(getUrl, crawlLimit);
    // 全部成功后触发
    resolveUrl.drain(() => {
        timer.clear();
        downloadImages();
    });
    // 推送任务至队列
    for (let i = 2; i < mangaImages + 1; i++) {
        // 错误时，结束进程
        resolveUrl.push({ url: `${mangaUrl.slice(0, mangaUrl.length - 5)}-${i}.html` }, (err, num) => {
            if (err) {
                console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0101]`);
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render(resolvedImgs, mangaImages);
            }
        });
    }
}
function downloadImages() {
    const timer = new misc_1.OutTimer(30, '0x0202');
    // 下载图片(并发控制)
    const download = async.queue(({ url }, callback) => {
        let pic = url.split("/")[url.split("/").length - 1];
        axios_1.default.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000,
        })
            .then(({ data }) => {
            fs.writeFile(`${savePath}/split/${pic}.jpg`, data, (err) => {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, 1);
                }
            });
        })
            .catch((err) => callback(err));
    }, crawlLimit);
    download.drain(() => {
        timer.clear();
        console.log(`${chalk.whiteBright.bgBlue(' Info ')} Generating HTML format file...\n`);
        generator_1.genHTML({
            imgAmount: mangaImages,
            path: savePath,
            dlTime: dlTime,
        });
    });
    // 下载进度条
    let downloadedImages = 0;
    const downloadPB = new progressBar_1.ProgressBar(undefined, mangaImages);
    downloadPB.render(downloadedImages, mangaImages);
    // 推送任务至队列
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            // 错误时，结束进程
            download.push({ url: crawlList[i] }, (err, result) => {
                if (err) {
                    console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                    console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0201]`);
                    process.exit(1);
                }
                else {
                    downloadedImages += result;
                    downloadPB.render(downloadedImages, mangaImages);
                }
            });
        }
    }
}
