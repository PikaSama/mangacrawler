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

// 本地模块
import {
    WorkerDownloadParam,
    WorkerCallbackFn,
    OutTimer,
    prepare,
} from "../modules/misc";
import { genHTML as generateManga } from "../modules/generator";
import { ProgressBar } from "../modules/progressBar";

let mangaUrl: string;
let savePath: string;
let crawlLimit: number;
let crawlList: string[] = [];
let mangaImages: number;
let dlTime: number;

function manhuaxin(): void {
    prepare("mhxin",(result): void => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        getMangaInfo();
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
    const timer: OutTimer = new OutTimer(10,'0x0002');
    dlTime = new Date().getTime();
    console.log(`${chalk.whiteBright.bgBlue(' Info ')} Fetching some information...\n`)
    getUrl({
        url: mangaUrl,
        extra: 'let images = p.split(\'<p>\')[1].split(\'</p>\')[0].split(\'/\')[1];mangaImages = parseInt(images);',
    },(err,num): void => {
        if (err) {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
            console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0001]`);
            process.exit(1);
        }
        else {
            timer.clear();
            resolveImages();
        }
    })
}

function resolveImages(): void {
    const timer: OutTimer = new OutTimer(30,'0x0102');
    // 获取图片的进度条
    let resolvedImgs: number = 1;
    const resolvePB: ProgressBar = new ProgressBar(undefined,mangaImages);
    resolvePB.render(resolvedImgs,mangaImages);
    // 获取图片链接(并发控制)
    const resolveUrl: async.QueueObject<object> = async.queue(getUrl,crawlLimit);
    // 全部成功后触发
    resolveUrl.drain((): void => {
        timer.clear();
        downloadImages();
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

function downloadImages(): void {
    console.log(`\n\n${chalk.whiteBright.bgBlue(' Info ')} Downloading manga...\n`);
    const timer: OutTimer = new OutTimer(30,'0x0202');
    // 下载图片(并发控制)
    const download: async.QueueObject<object> = async.queue(({ url }: WorkerDownloadParam,callback: WorkerCallbackFn): void => {
        let pic = url.split("/")[url.split("/").length - 1];
        axios.get(url,{
            responseType: 'arraybuffer',
            timeout: 10000,
        })
            .then(({data}) => {
                fs.writeFile(`${savePath}/split/${parseInt(pic) + 1}.jpg`,data,(err): void => {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null,1);
                    }
                });
            })
            .catch((err): void => callback(err));
    },crawlLimit);
    download.drain((): void => {
        timer.clear();
        console.log(`\n\n${chalk.whiteBright.bgBlue(' Info ')} Generating HTML format file...\n`);
        generateManga({
            imgAmount: mangaImages,
            path: savePath,
            dlTime: dlTime,
        });
    });
    // 下载进度条
    let downloadedImages: number = 0;
    const downloadPB: ProgressBar = new ProgressBar(undefined,mangaImages);
    downloadPB.render(downloadedImages,mangaImages);
    // 推送任务至队列
    for (let i in crawlList) {
        if (crawlList.hasOwnProperty(i)) {
            // 错误时，结束进程
            download.push({ url: crawlList[i] },(err: Error,result: number): void => {
                if (err) {
                    console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} ${err} \n`);
                    console.error(`${chalk.whiteBright.bgRed(' Error ')} Oops! Something went wrong, try again? [M-0x0201]`);
                    process.exit(1);
                }
                else {
                    downloadedImages += result;
                    downloadPB.render(downloadedImages,mangaImages);
                }
            });
        }
    }
}

export { manhuaxin };