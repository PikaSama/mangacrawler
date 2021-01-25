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

// 本地模块
import { WorkerDownloadParam, CallbackFn, OutTimer, Logger, downloadImg } from '../modules/utils';
import { prepare } from '../modules/yau';

import { genHTML as generateManga } from '../modules/generator';
import { ProgressBar } from '../modules/progressBar';

let mangaUrl = '';
let savePath = '';
let crawlLimit = 0;
let crawlList: string[] = [];
let mangaImages = 0;
let dlTime = 0;

function manhuaxin(): void {
    prepare('mhxin', (err, result): void => {
        ({ url: mangaUrl, path: savePath, limit: crawlLimit } = result);
        getMangaInfo();
    });
}

/**
 * 解析图片地址函数参数
 * @property url 漫画地址(单页)
 * @property getPages 获取漫画页数
 */
interface resolveParams {
    url: string;
    getPages?: number;
}

function getUrl(params: resolveParams, callback: CallbackFn): void {
    const { url, getPages } = params;
    axios
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
        .catch((err): void => callback(err));
}

function getMangaInfo(): void {
    const timer = new OutTimer(10, '0x0002');
    dlTime = new Date().getTime();
    Logger.info('Fetching some information...\n');
    // 第一次解析图片地址，获取漫画页数
    getUrl(
        {
            url: mangaUrl,
            getPages: 1,
        },
        (err): void => {
            if (err) {
                Logger.newLine(1);
                Logger.err(`${err} \n`);
                Logger.err('Oops! Something went wrong, try again? [M-0x0001]');
                process.exit(1);
            } else {
                timer.clear();
                resolveImages();
            }
        },
    );
}

function resolveImages(): void {
    const timer = new OutTimer(30, '0x0102');
    // 获取图片的进度条
    let resolvedImgs = 1;
    const resolvePB: ProgressBar = new ProgressBar(mangaImages);
    resolvePB.render(resolvedImgs, mangaImages);
    // 获取图片链接(并发控制)
    const resolveUrl = async.queue(getUrl, crawlLimit);
    // 全部成功后触发
    resolveUrl.drain((): void => {
        timer.clear();
        resolvePB.clear();
        downloadImages();
    });

    // 推送任务至队列
    for (let i = 2; i < mangaImages + 1; i += 1) {
        // 错误时，结束进程
        resolveUrl.push({ url: `${mangaUrl.slice(0, mangaUrl.length - 5)}-${i}.html` }, (err): void => {
            if (err) {
                Logger.newLine(1);
                Logger.err(`${err} \n`);
                Logger.err('Oops! Something went wrong, try again? [M-0x0001]');
                process.exit(1);
            } else {
                resolvedImgs += 1;
                resolvePB.render(resolvedImgs, mangaImages);
            }
        });
    }
}

function downloadImages(): void {
    Logger.newLine(1);
    Logger.info('Downloading manga...\n');
    const timer = new OutTimer(30, '0x0202');
    // 下载图片(并发控制)
    const download = async.queue((param: WorkerDownloadParam, callback: CallbackFn): void => {
        const { url } = param;
        const pic = url.split('/')[url.split('/').length - 1];
        const path = `${savePath}/split/${parseInt(pic, 10) + 1}.jpg`;
        downloadImg(
            {
                url,
                path,
            },
            (err): void => {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            },
        );
    }, crawlLimit);

    download.drain((): void => {
        timer.clear();
        downloadPB.clear();
        Logger.newLine(1);
        Logger.info('Generating HTML format file...\n');
        generateManga({
            imgAmount: mangaImages,
            path: savePath,
            dlTime,
        });
    });

    // 下载进度条
    let downloadedImages = 0;
    const downloadPB = new ProgressBar(mangaImages);
    downloadPB.render(downloadedImages, mangaImages);
    // 推送任务至队列
    crawlList.map((_val, index): string => {
        download.push({ url: crawlList[index] }, (err): void => {
            if (err) {
                Logger.newLine(1);
                Logger.err(`${err} \n`);
                Logger.err('Oops! Something went wrong, try again? [M-0x0001]');
                process.exit(1);
            } else {
                downloadedImages += 1;
                downloadPB.render(downloadedImages, mangaImages);
            }
        });
        return '';
    });
}

export { manhuaxin };
