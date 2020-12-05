/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“漫画芯”的漫画下载模块
 * License: GPL-3.0
 */

import axios from 'axios';
import * as async from 'async';
import * as cheerio from 'cheerio';
import * as chalk from "chalk";
import * as fs from 'fs';
import Timeout = NodeJS.Timeout;

// 本地模块
import { WorkerCallbackFn } from "./dm5";
import { cli } from '../modules/cli';
import { checkPath } from "../modules/dirCheck";
import { genHTML as generateManga } from "../modules/generator";
import { ProgressBar } from "../modules/progressBar";
import exp = require("constants");

let mangaUrl: string;
let savePath: string;
let crawlLimit: number;
let crawlList: string[] = [];
let mangaImages: number;
let dlTime: number;

function prepare(): void {
    cli("mhxin",(result): void => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        checkPath(savePath,(): void => {
            getMangaInfo();
        });
    });
}

function getUrl({ url, extra }: { url: string, extra: string },callback: WorkerCallbackFn): void {
    extra = extra || '';
    axios.get(url,{ timeout: 6000 })
        .then(({ data }) => {
            const $: cheerio.Root = cheerio.load(data);
            let statement: string[] = $("div#images").next().html().split("}");
            statement[7] = extra + "let pushFunc = p.split(';').slice(0,5);let url = pushFunc[4].split('\"')[1];pushFunc[3] = pushFunc[3].split('}').slice(0,3).join('}') + '}crawlList.push(getImageUrl(\\'' + url + '\\'))';return pushFunc.slice(0,4).join(';')";
            eval(statement.join("}"));
            callback(null,1);
        })
        .catch((err): void => callback(err));
}

function getMangaInfo(): void {
    let status: number = 0;
    // 超时，结束进程
    const timer: Timeout = setTimeout((): void => {
        if (!status) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Erorr ')} Timed out for 10 secconds. [M-0x0002]`);
            process.exit(1);
        }
    },10000);
    dlTime = new Date().getTime();
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Fetching some information...\n`)
    getUrl({
        url: mangaUrl,
        extra: 'let images = p.split(\'<p>\')[1].split(\'</p>\')[0].split(\'/\')[1];mangaImages = parseInt(images);',
    },(err,num): void => {
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
    })
}

function resolveImages(): void {
    let status: number = 0;
    // 超时，结束进程
    const timer: Timeout = setTimeout((): void => {
        if (!status) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Erorr ')} Timed out for 30 secconds. [M-0x0102]`);
            process.exit(1);
        }
    },30000);
    // 获取图片的进度条
    let resolvedImgs: number = 1;
    const resolvePB: ProgressBar = new ProgressBar(undefined,mangaImages);
    resolvePB.render(resolvedImgs,mangaImages);
    // 获取图片链接(并发控制)
    const resolveUrl: async.QueueObject<object> = async.queue(getUrl,crawlLimit);
    // 全部成功后触发
    resolveUrl.drain((): void => {
        status = 1;
        clearTimeout(timer);
        console.log(crawlList);
    });
    // 推送任务至队列
    for (let i = 2;i < mangaImages + 1;i++) {
        // 错误时，结束进程
        resolveUrl.push({ url: `${mangaUrl.slice(0,mangaUrl.length - 5)}-${i}.html` },(err: Error,num: number): void => {
            if (err) {
                console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0101]`);
                process.exit(1);
            }
            else {
                resolvedImgs += num;
                resolvePB.render(resolvedImgs,mangaImages);
            }
        });
    }
}

export { prepare };