"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“动漫屋”的漫画下载模块
 * License: GPL-3.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dongmanwu = void 0;
const axios_1 = __importDefault(require("axios"));
const async = __importStar(require("async"));
const cheerio = __importStar(require("cheerio"));
const inquirer = __importStar(require("inquirer"));
const puppeteer = __importStar(require("puppeteer"));
// 本地模块
const misc_1 = require("../modules/misc");
const generator_1 = require("../modules/generator");
const progressBar_1 = require("../modules/progressBar");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let mangaInfo = {
    cid: '',
    mid: '',
    sign: '',
    signdate: '',
    msg: '',
    pics: 0,
};
let dlTime;
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
    misc_1.prepare('dm5', (err, result) => {
        if (err) {
            misc_1.Logger.err(err);
            process.exit(1);
        }
        else {
            ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
            getMangaInfo().catch((err) => {
                // 发生错误，结束浏览器进程
                misc_1.Logger.err(`${err} [M-0x0101]\n`);
                process.exit(1);
            });
        }
    });
}
exports.dongmanwu = dongmanwu;
function getMangaInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        dlTime = new Date().getTime();
        misc_1.Logger.info('Starting browser...\n');
        const browser = yield puppeteer.launch();
        misc_1.Logger.info('Opening page...\n');
        const page = yield browser.newPage();
        yield page.goto(mangaUrl, { waitUntil: 'networkidle2' });
        misc_1.Logger.info('Fetching some information...\n');
        // 获取漫画信息，用户信息（请求参数）
        const $ = cheerio.load(yield page.content());
        if ($('div.chapterpager').length > 0) {
            mangaInfo.pics = parseInt($('div.chapterpager').eq(0).children('a').last().text());
            mangaInfo.msg = misc_1.Logger.info(`Manga type: A | Pictures: ${mangaInfo.pics}\n`, 1);
        }
        else {
            mangaInfo.pics = $('img.load-src').length;
            mangaInfo.msg = misc_1.Logger.info(`Manga type: B | Pictures: ${mangaInfo.pics}\n`, 1);
        }
        mangaInfo = yield page.evaluate((pics, msg) => {
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
        }, mangaInfo.pics, mangaInfo.msg);
        console.log(mangaInfo.msg);
        yield browser.close();
        resolveImages();
    });
}
function resolveImages() {
    misc_1.Logger.info('Resolving images...\n');
    const timer = new misc_1.OutTimer(30, '0x0201');
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new progressBar_1.ProgressBar(undefined, mangaInfo.pics);
    resolvePB.render(resolvedImgs, mangaInfo.pics);
    // 获取图片链接(并发控制)
    const getPicUrl = async.queue(({ pic }, callback) => {
        let resolveParams = [
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
        axios_1.default
            .get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, {
            headers: {
                Referer: mangaUrl,
            },
            timeout: 10000,
        })
            .then(({ data }) => {
            let statement = data.split('}');
            statement[4] = statement[4].slice(0, statement[4].length - 1) + " + 'crawlList.push(d[0])'";
            eval(statement.join('}'));
            callback(null, 1);
        })
            .catch((err) => callback(err));
    }, crawlLimit);
    // 全部成功后触发
    getPicUrl.drain(() => {
        timer.clear();
        misc_1.Logger.newLine(2);
        misc_1.Logger.info('Checking server node list...\n');
        checkNode(crawlList[0]);
    });
    // 推送任务至队列
    for (let i = 0; i < mangaInfo.pics; i++) {
        // 错误时，结束进程
        getPicUrl.push({ pic: i + 1 }, (err, num) => {
            if (err) {
                misc_1.Logger.newLine(2);
                misc_1.Logger.err(`${err} \n`);
                misc_1.Logger.err('Oops! Something went wrong, try again? [M-0x0202]');
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render(resolvedImgs, mangaInfo.pics);
            }
        });
    }
}
function checkNode(node) {
    // 获取当前下载节点
    let nodeCopy = node.split('/')[2].split('-');
    nodeCopy.shift();
    node = nodeCopy.join('-');
    // 与节点列表比对
    let isKnownNode;
    for (let i in nodeList) {
        if (nodeList.hasOwnProperty(i)) {
            if (node === nodeList[i]) {
                isKnownNode = 1;
                break;
            }
        }
    }
    if (isKnownNode) {
        misc_1.Logger.info('The server you are connected to is inclued in the list.\n');
    }
    else {
        misc_1.Logger.warn('You are connected to an unknown server. Report it later?\n');
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
        misc_1.Logger.err(`${err} \n`);
        misc_1.Logger.err('Oops! Something went wrong, try again? [M-0x0203]');
        process.exit(1);
    });
}
function downloadImages(node) {
    misc_1.Logger.newLine(2);
    misc_1.Logger.info('Downloading manga...\n');
    const timer = new misc_1.OutTimer(30, '0x0301');
    // 替换节点
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            let url = crawlList[i].split('/');
            url[2] = url[2].split('-')[0] + '-' + node;
            crawlList[i] = url.join('/');
        }
    }
    // 下载图片(并发控制)
    const download = async.queue(({ url }, callback) => {
        const picNum = url.split('/')[6].split('_')[0];
        const fullPath = `${savePath}/split/${picNum}.jpg`;
        misc_1.downloadImg(url, fullPath, {
            headers: {
                Referer: mangaUrl,
            },
            timeout: 10000,
        }, (err) => {
            if (err) {
                callback(err);
            }
            else {
                callback(null, 1);
            }
        });
    }, crawlLimit);
    // 全部完成时触发
    download.drain(() => {
        timer.clear();
        misc_1.Logger.newLine(2);
        misc_1.Logger.info('Generating HTML format file...\n');
        generator_1.genHTML({
            imgAmount: mangaInfo.pics,
            path: savePath,
            dlTime: dlTime,
        });
    });
    // 下载进度条
    let downloadedImgs = 0;
    const downloadPB = new progressBar_1.ProgressBar(undefined, mangaInfo.pics);
    downloadPB.render(downloadedImgs, mangaInfo.pics);
    // 推送任务至队列
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            // 错误时，结束进程
            download.push({ url: crawlList[i] }, (err, result) => {
                if (err) {
                    misc_1.Logger.newLine(2);
                    misc_1.Logger.err(`${err} \n`);
                    misc_1.Logger.err('Oops! Something went wrong, try again? [M-0x0302]');
                    process.exit(1);
                }
                else {
                    downloadedImgs += result;
                    downloadPB.render(downloadedImgs, mangaInfo.pics);
                }
            });
        }
    }
}
