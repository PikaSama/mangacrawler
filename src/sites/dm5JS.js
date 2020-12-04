/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“动漫屋”的漫画下载模块
 * License: GPL-3.0
 */
// 依赖
const axios = require("axios");
const async = require("async");
const inquirer = require("inquirer");
let puppeteer;
// Node API
const fs = require("fs");
// 本地模块
const cli = require("../modules/cli");
const checkPath = require("../modules/dirCheckJS");
const generateManga = require("../modules/generatorJS");
const ProgressBar = require("../modules/progressbarJS");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let info = {};
let dlTime;
// 节点列表
const nodeList = [
    "112-53-225-216.cdndm5.com",
    "101-69-161-98.cdndm5.com",
    "101-69-161-99.cdndm5.com",
    "61-174-50-98.cdndm5.com",
    "61-174-50-99.cdndm5.com",
    "104-250-139-219.cdnmanhua.net",
    "104-250-150-12.cdnmanhua.net"
];
function initialize() {
    try {
        puppeteer = require("puppeteer");
        console.log("\033[44;37m Info \033[0m Found module : 'puppeteer'.\n");
    }
    catch (err) {
        console.error("\033[41;37m Error \033[0m Could not find module 'puppeteer', have you already installed it ? [M-0x0001]\n");
        process.exit(1);
    }
    prepare();
}
function prepare() {
    cli("dm5",result => {
        ({ mangaUrl, savePath, crawlLimit } = result);
        checkPath(savePath,() => {
            getMangaInfo().catch(err => {
                //  发生错误，结束浏览器进程
                console.error("\n\033[41;37m Error \033[0m " + err + "[M-0x0101]\n");
                process.exit(1);
            });
        });
    });
}
async function getMangaInfo() {
    dlTime = new Date().getTime();
    console.log("\033[44;37m Info \033[0m Starting browser...\n");
    const browser = await puppeteer.launch();
    console.log("\033[44;37m Info \033[0m Opening page...\n");
    const page = await browser.newPage();
    await page.goto(mangaUrl, { waitUntil: 'networkidle2' });
    console.log("\033[44;37m Info \033[0m Fetching some information...\n");
    // 获取漫画信息，用户信息（请求参数）
    info = await page.evaluate(() => {
        const $ = window.$;
        let imgs;
        let log;
        if ($("div.chapterpager").length > 0) {
            imgs = parseInt($("div.chapterpager:eq(0) a:last").text());
            log = "\033[44;37m Info \033[0m Manga type: B(multi-page manga) | Pictures: " + imgs + "\n";
        }
        else {
            imgs = $("img.load-src").length;
            log = "\033[44;37m Info \033[0m Manga type: A(single-page manga) | Pictures: " + imgs + "\n";
        }
        return {
            picAmount: imgs,
            msg: log,
            cid: window.DM5_CID,
            mid: window.DM5_MID,
            sign: window.DM5_VIEWSIGN,
            signdate: window.DM5_VIEWSIGN_DT,
        }
    });
    console.log(info.msg);
    await browser.close();
    resolveImages();
}
function resolveImages() {
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error("n\\n\033[41;37m Error \033[0m Timed out for 30 secconds. [M-0x0201]");
            process.exit(1);
        }
    },30000);
    console.log("\033[44;37m Info \033[0m Resolving images...\n");
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new ProgressbarJS(null,info.picAmount);
    resolvePB.render({ completed: resolvedImgs, total: info.picAmount });
    // 获取图片链接(并发控制)
    const getPicUrl = async.queue((obj,callback) => {
        let resolveParams = [
            `cid=${info.cid}`,
            `page=${obj.pic}`,
            `key=`,
            `language=1`,
            `gtk=6`,
            `_cid=${info.cid}`,
            `_mid=${info.mid}`,
            `_dt=${encodeURIComponent(info.signdate)}`,
            `_sign=${info.sign}`,
        ].join("&");
        axios.get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, { headers: { 'Referer': mangaUrl }, timeout: 10000 }).then(({ data }) => {
            eval(data);
            crawlList.push(d[0]);
            callback(null,1);
        }).catch(err => callback(err));
    },crawlLimit);
    // 全部成功后触发
    getPicUrl.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log("\n\n\033[44;37m Info \033[0m Checking the server node...\n");
        checkNode(crawlList[0]);
    });
    // 推送任务至队列
    for (let i = 0;i < info.picAmount;i++) {
        // 错误时，结束进程
        getPicUrl.push({ pic: i + 1 },(err,num) => {
            if (err) {
                console.error("\n\n\033[41;37m Error \033[0m " + err +"\n");
                console.error("\033[41;37m Error \033[0m Oops! Something went wrong, try again? [M-0x0202]");
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render({ completed: resolvedImgs, total: info.picAmount });
            }
        });
    }
}
function checkNode(defaultNode) {
    // 获取当前下载节点
    defaultNode = defaultNode.split("/")[2].split("-");
    defaultNode.shift();
    defaultNode=defaultNode.join("-");
    // 与节点列表比对
    let isKnownNode = 0;
    for (let i in nodeList) {
        if (nodeList.hasOwnProperty(i)) {
            if (defaultNode === nodeList[i]) {
                isKnownNode = 1;
                break;
            }
        }
    }
    if (isKnownNode) {
        console.log("\033[44;37m Info \033[0m The server you are conneted to is included in the list.\n");
    }
    else {
        console.warn('\033[41;37m Warn \033[0m The server you are conneted to is NOT included in the list. (Unknown server)\n');
        nodeList.unshift(defaultNode);
    }
    inquirer.prompt([
        {
            type: 'list',
            name: 'node',
            message: 'Please select a server to download images.',
            choices: nodeList,
        },
    ]).then(answer => { downloadImages(answer.node) });
}
function downloadImages(node) {
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error("\n\n\033[41;37m Error \033[0m Timed out for 30 secconds. [M-0x0301]");
            process.exit(1);
        }
    },30000);
    // 替换节点
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            let url = crawlList[i].split("/");
            url[2] = url[2].split("-")[0] + "-" + node;
            crawlList[i] = url.join("/");
        }
    }
    // 下载图片(并发控制)
    const download = async.queue((obj,callback) => {
        let picNum = obj.url.split("/")[6].split("_")[0];
        axios.get(obj.url, {
            headers: { 'Referer': mangaUrl },
            responseType: 'arraybuffer',
            timeout: 10000
        }).then(({ data }) => {
            fs.writeFile(`${savePath}/split/${picNum}.jpg`,data,err => {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null,1);
                }
            });
        }).catch(err => callback(err));
    },crawlLimit);
    // 全部完成时触发
    download.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log("\n\n\033[44;37m Info \033[0m Generating HTML format file...\n");
        generateManga({ imgAmount: info.picAmount, path: savePath, dlTime: dlTime });
    });
    // 下载进度条
    let downloadedImgs = 0;
    const downloadPB = new ProgressbarJS(null,info.picAmount);
    downloadPB.render({ completed: 0, total: info.picAmount });
    // 推送任务至队列
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            // 错误时，结束进程
            download.push({ url: crawlList[i] },(err,result) => {
                if (err) {
                    console.error("\n\n\033[41;37m Error \033[0m " + err + "\n");
                    console.error("\033[41;37m Error \033[0m Oops! Something went wrong, try again? [M-0x0302]");
                    process.exit(1);
                }
                else {
                    downloadedImgs += result;
                    downloadPB.render({ completed: downloadedImgs, total: info.picAmount });
                }
            });
        }
    }
}
module.exports = initialize;