/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“漫画芯”的漫画下载模块
 * License: GPL-3.0
 */

// 依赖
const axios = require("axios");
const async = require("async");
const cheerio = require("cheerio");

// Node API
const fs = require("fs");

// 本地模块
const cli = require("../modules/cli")
const checkPath = require("../modules/dirCheckJS");
const generateManga = require("../modules/generatorJS");
const ProgressBar = require("../modules/progressbarJS");

let mangaUrl;
let savePath;
let crawlLimit;

let crawlList = [];

let mangaImages = 0;

let dlTime;

function prepare() {
    cli("mhxin",result => {
        ({ mangaUrl, savePath, crawlLimit } = result);
        checkPath(savePath,() => {
            getMangaInfo();
        });
    });
}

/**
 * @param url {string} 漫画页数地址 & 附加代码
 * @param extra {string}
 * @param callback {function} 回调函数
 */
function getUrl({ url, extra },callback) {
    axios.get(url,{ timeout: 6000 })
        .then(({ data }) => {
            const $ = cheerio.load(data);
            let statement = $("div#images").next().html().split("}");
            extra = extra || '';
            statement[7]=extra + "let pushFunc = p.split(';').slice(0,5);let url = pushFunc[4].split('\"')[1];pushFunc[3] = pushFunc[3].split('}').slice(0,3).join('}') + '}crawlList.push(getImageUrl(\\'' + url + '\\'))';return pushFunc.slice(0,4).join(';')";
            eval(statement.join("}"));
            callback(null,1);
        })
        .catch(err => callback(err));
}

function getMangaInfo() {
    let status = 0;
    // 超时10秒，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error("n\\n\033[41;37m Error \033[0m Timed out for 30 secconds. [M-0x0002]");
            process.exit(1);
        }
    },10000);
    dlTime = new Date().getTime();
    console.log("\033[44;37m Info \033[0m Fetching some information...\n");
    getUrl({
        url: mangaUrl,
        extra: 'let images = p.split(\'<p>\')[1].split(\'</p>\')[0].split(\'/\')[1];mangaImages = parseInt(images);',
    },(err,num) => {
        if (err) {
            console.error("\n\n\033[41;37m Error \033[0m " + err +"\n");
            console.error("\033[41;37m Error \033[0m Oops! Something went wrong, try again? [M-0x0001]");
            process.exit(1);
        }
        else {
            clearTimeout(timer);
            console.log("\033[44;37m Info \033[0m Pictures of manga: " + mangaImages + "\n");
            resolveImages();
        }
    });
}

function resolveImages() {
    let status = 0;
    // 超时30秒，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error("n\\n\033[41;37m Error \033[0m Timed out for 30 secconds. [M-0x0102]");
            process.exit(1);
        }
    },30000);
    // 获取图片的进度条
    let resolvedImgs = 1;
    const resolvePB = new ProgressbarJS(null,mangaImages);
    resolvePB.render({ completed: resolvedImgs, total: mangaImages });
    // 获取图片链接(并发控制)
    const resolveUrl = async.queue(getUrl,crawlLimit);
    // 全部成功后触发
    resolveUrl.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log("\n\n\033[44;37m Info \033[0m Checking the server node...\n");
        console.log(crawlList);
    });
    // 推送任务至队列
    for (let i = 2;i < mangaImages + 1;i++) {
        // 错误时，结束进程
        resolveUrl.push({ url: `${mangaUrl.slice(0,mangaUrl.length - 5)}-${i}.html` },(err,num) => {
            if (err) {
                console.error("\n\n\033[41;37m Error \033[0m " + err +"\n");
                console.error("\033[41;37m Error \033[0m Oops! Something went wrong, try again? [M-0x0101]");
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render({ completed: resolvedImgs, total: mangaImages });
            }
        });
    }
}

module.exports = prepare;
