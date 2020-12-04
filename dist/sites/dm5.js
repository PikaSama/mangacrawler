"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“动漫屋”的漫画下载模块
 * License: GPL-3.0
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const async = require("async");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
// 本地模块
const cli_1 = require("../modules/cli");
const dirCheck_1 = require("../modules/dirCheck");
const progressBar_1 = require("../modules/progressBar");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let mangaInfo = {
    pics: 0,
    msg: '',
    cid: '',
    mid: '',
    sign: '',
    signdate: '',
};
let dlTime;
// 节点列表
let nodeList = [
    "112-53-225-216.cdndm5.com",
    "101-69-161-98.cdndm5.com",
    "101-69-161-99.cdndm5.com",
    "61-174-50-98.cdndm5.com",
    "61-174-50-99.cdndm5.com",
    "104-250-139-219.cdnmanhua.net",
    "104-250-150-12.cdnmanhua.net",
];
function prepare() {
    cli_1.cli("dm5", result => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        dirCheck_1.checkPath(savePath, () => {
            getMangaInfo().catch(err => {
                //  发生错误，结束浏览器进程
                console.error(`${chalk.whiteBright.bgRed(' Error ')} ${err} [M-0x0101]\n`);
                process.exit(1);
            });
        });
    });
}
function getMangaInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        dlTime = new Date().getTime();
        console.log(`${chalk.whiteBright.bgBlue(' Info ')} Starting browser...\n`);
        const browser = yield puppeteer.launch();
        console.log(`${chalk.whiteBright.bgBlue(' Info ')} Opening page...\n`);
        const page = yield browser.newPage();
        yield page.goto(mangaUrl, { waitUntil: 'networkidle2' });
        console.log(`${chalk.whiteBright.bgBlue(' Info ')} Fetching some information...\n`);
        // 获取漫画信息，用户信息（请求参数）
        const $ = cheerio.load(yield page.content());
        if ($("div.chapterpager").length > 0) {
            mangaInfo.pics = parseInt($("div.chapterpager")
                .eq(0)
                .children("a")
                .last()
                .text());
            mangaInfo.msg = `${chalk.whiteBright.bgBlue(' Info ')} Manga type: B(multi-page manga) | Pictures: ${mangaInfo.pics}\n`;
        }
        else {
            mangaInfo.pics = $("img.load-src").length;
            `${chalk.whiteBright.bgBlue(' Info ')} Manga type: B(multi-page manga) | Pictures: ${mangaInfo.pics}\n`;
        }
        const result = yield page.evaluate(() => {
            return {
                cid: window.DM5_CID,
                mid: window.DM5_MID,
                sign: window.DM5_VIEWSIGN,
                signdate: window.DM5_VIEWSIGN_DT,
            };
        });
        ({ cid: mangaInfo.cid, mid: mangaInfo.mid, sign: mangaInfo.sign, signdate: mangaInfo.signdate } = result);
        console.log(mangaInfo.msg);
        console.log(mangaInfo);
        yield browser.close();
        resolveImages();
    });
}
function resolveImages() {
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Erorr ')} Timed out for 30 secconds. [M-0x0201]`);
            process.exit(1);
        }
    }, 30000);
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new progressBar_1.ProgressBar(null, mangaInfo.pics);
    resolvePB.render(resolvedImgs, mangaInfo.pics);
    // 获取图片链接(并发控制)
    const getPicUrl = async.queue((obj, callback) => {
        let resolveParams = [
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
        axios_1.default.get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, {
            headers: {
                'Referer': mangaUrl
            },
            timeout: 10000,
        })
            .then(({ data }) => {
            callback(null, 1);
        })
            .catch(err => callback(err));
    }, crawlLimit);
    // 全部成功后触发
    getPicUrl.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log(`\n\n${chalk.whiteBright.bgBlue(' Info ')} Checking server node list....\n`);
    });
    // 推送任务至队列
    for (let i = 0; i < mangaInfo.pics; i++) {
        // 错误时，结束进程
        getPicUrl.push({ pic: i + 1 }, (err, num) => {
            if (err) {
                console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0202]`);
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render(resolvedImgs, mangaInfo.pics);
            }
        });
    }
}
prepare();