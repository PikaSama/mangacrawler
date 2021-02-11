"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 工具模块
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImg = exports.OutTimer = exports.Logger = void 0;
const chalk = require("chalk");
// import { default as axios, AxiosRequestConfig } from 'axios';
const axios_1 = require("axios");
// 本地模块
const fs = require("fs");
// 日志打印 -- 模块
const Logger = {
    err: (msg) => console.log(`${chalk.bgRed(' ERROR ')} ${msg}`),
    warn: (msg) => console.log(`${chalk.bgRed(' WARN ')} ${msg}`),
    info: (msg) => console.log(`${chalk.bgBlue(' INFO ')} ${msg}`),
    done: (msg) => console.log(`${chalk.bgGreen(' DONE ')} ${msg}`),
    upd: (msg) => console.log(`${chalk.bgYellow(' UPDATE ')} ${msg}`),
    debug: (msg) => console.log(`${chalk.bgGray(' DEBUG ')}`, msg),
    newLine: (lines) => console.log('\n'.repeat(lines)),
    str: {
        err: (msg) => `${chalk.bgRed(' ERROR ')} ${msg}`,
        warn: (msg) => `${chalk.bgRed(' WARN ')} ${msg}`,
        info: (msg) => `${chalk.bgBlue(' INFO ')} ${msg}`,
        done: (msg) => `${chalk.bgGreen(' DONE ')} ${msg}`,
        upd: (msg) => `${chalk.bgYellow(' UPDATE ')} ${msg}`,
    },
};
exports.Logger = Logger;
// 超时计时器 -- 漫画
class OutTimer {
    constructor(timeout, errorCode) {
        // 超时，结束进程
        this.timerID = setTimeout(() => {
            Logger.err(`\n\nTimed out for ${timeout} seconds. [M-${errorCode}]`);
            process.exit(1);
        }, timeout * 1000);
    }
    // 成功，清除计时器
    clear() {
        clearTimeout(this.timerID);
    }
}
exports.OutTimer = OutTimer;
// 下载文件 -- 模块
function downloadImg(params, callback, config = {}) {
    const { url, path } = params;
    config.responseType = 'stream';
    const writer = fs.createWriteStream(path);
    axios_1.default
        .get(url, config)
        .then(({ data }) => data.pipe(writer))
        .catch((err) => callback(err));
    writer.on('finish', () => callback(null));
    writer.on('error', () => callback('error'));
}
exports.downloadImg = downloadImg;
