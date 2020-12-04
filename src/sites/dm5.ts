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
import Timeout = NodeJS.Timeout;

// 本地模块
import { cli } from '../modules/cli';
import { checkPath } from "../modules/dirCheck";
import { genHTML as generateManga } from "../modules/generator";
import { ProgressBar } from "../modules/progressBar";

interface Result {
    cid: string,
    mid: string,
    sign: string,
    signdate: string,
}

interface Info extends Result {
    pics: number,
    msg: string,
}

interface ResolveWorkerObject {
    pic: number
}

interface WorkerCallbackFn {
    (err: Error, result?: number): void
}

interface AxiosResp {

}

let mangaUrl: string;
let savePath: string;
let crawlLimit: number;
let crawlList: string[] = [];
let mangaInfo: Info = {
    pics: 0,
    msg: '',
    cid: '',
    mid: '',
    sign: '',
    signdate: '',
}
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

function prepare(): void {
    cli("dm5",result => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        checkPath(savePath,() => {
            getMangaInfo().catch(err => {
                //  发生错误，结束浏览器进程
                console.error(`${chalk.whiteBright.bgRed(' Error ')} ${err} [M-0x0101]\n`);
                process.exit(1);
            });
        });
    });
}

async function getMangaInfo(): Promise<void> {
    dlTime = new Date().getTime();
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Starting browser...\n`);
    const browser: puppeteer.Browser = await puppeteer.launch();
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Opening page...\n`);
    const page: puppeteer.Page = await browser.newPage();
    await page.goto(mangaUrl,{ waitUntil: 'networkidle2' });
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Fetching some information...\n`)
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
        mangaInfo.msg = `${chalk.whiteBright.bgBlue(' Info ')} Manga type: B(multi-page manga) | Pictures: ${mangaInfo.pics}\n`;
    }
    else {
        mangaInfo.pics = $("img.load-src").length;
        `${chalk.whiteBright.bgBlue(' Info ')} Manga type: B(multi-page manga) | Pictures: ${mangaInfo.pics}\n`;
    }
    const result: Result = await page.evaluate((): Result => {
        return {
            cid: window.DM5_CID,
            mid: window.DM5_MID,
            sign: window.DM5_VIEWSIGN,
            signdate: window.DM5_VIEWSIGN_DT,
        }
    });
    ({ cid: mangaInfo.cid, mid: mangaInfo.mid, sign: mangaInfo.sign, signdate: mangaInfo.signdate } = result);
    console.log(mangaInfo.msg);
    console.log(mangaInfo);
    await browser.close();
}

function resolveImages() {
    let status: number = 0;
    // 超时，结束进程
    const timer: Timeout = setTimeout(() => {
        if (!status) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Erorr ')} Timed out for 30 secconds. [M-0x0201]`);
            process.exit(1);
        }
    },30000);
    // 获取图片的进度条
    let resolvedImgs: number = 0;
    const resolvePB: ProgressBar = new ProgressBar(null,mangaInfo.pics);
    resolvePB.render(resolvedImgs,mangaInfo.pics);
    // 获取图片链接(并发控制)
    const getPicUrl: async.QueueObject<object> = async.queue((obj: ResolveWorkerObject,callback: WorkerCallbackFn): void => {
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
        axios.get(`${mangaUrl}/chapterfun.ashx?${resolveParams}`, {
            headers: {
                'Referer': mangaUrl
            },
            timeout: 10000,
        })
            .then(({ data }) => {
                console.log(data);
                callback(null,1);
            })
            .catch(err => callback(err));
    },crawlLimit);
    // 全部成功后触发
    getPicUrl.drain((): void => {
        status = 1;
        clearTimeout(timer);
        console.log(`\n\n${chalk.whiteBright.bgBlue(' Info ')} Checking server node list....\n`);
    });
    // 推送任务至队列
    for (let i = 0;i < mangaInfo.pics;i++) {
        // 错误时，结束进程
        getPicUrl.push({ pic: i + 1 },(err: Error,num: number) => {
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