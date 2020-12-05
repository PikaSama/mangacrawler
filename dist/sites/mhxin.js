"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“漫画芯”的漫画下载模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = void 0;
const axios_1 = require("axios");
const async = require("async");
const cheerio = require("cheerio");
const chalk = require("chalk");
const cli_1 = require("../modules/cli");
const dirCheck_1 = require("../modules/dirCheck");
const progressBar_1 = require("../modules/progressBar");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let mangaImages;
let dlTime;
function prepare() {
    cli_1.cli("mhxin", (result) => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        dirCheck_1.checkPath(savePath, () => {
            getMangaInfo();
        });
    });
}
exports.prepare = prepare;
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
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Erorr ')} Timed out for 10 secconds. [M-0x0002]`);
            process.exit(1);
        }
    }, 10000);
    dlTime = new Date().getTime();
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Fetching some information...\n`);
    getUrl({
        url: mangaUrl,
        extra: 'let images = p.split(\'<p>\')[1].split(\'</p>\')[0].split(\'/\')[1];mangaImages = parseInt(images);',
    }, (err, num) => {
        if (err) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
            console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0202]`);
            process.exit(1);
        }
        else {
            status = 1;
            clearTimeout(timer);
            resolveImages();
        }
    });
}
function resolveImages() {
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Erorr ')} Timed out for 30 secconds. [M-0x0102]`);
            process.exit(1);
        }
    }, 30000);
    // 获取图片的进度条
    let resolvedImgs = 1;
    const resolvePB = new progressBar_1.ProgressBar(undefined, mangaImages);
    resolvePB.render(resolvedImgs, mangaImages);
    // 获取图片链接(并发控制)
    const resolveUrl = async.queue(getUrl, crawlLimit);
    // 全部成功后触发
    resolveUrl.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log(crawlList);
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
