/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 杂项模块
 * License: GPL-3.0
 */

import * as chalk from 'chalk';
// import { default as axios, AxiosRequestConfig } from 'axios';
import axios, { AxiosRequestConfig } from 'axios';

// 本地模块
import { cli } from './cli';
import { checkPath } from './dirCheck';
import * as fs from 'fs';

// 错误内容
type ErrorSets = NodeJS.ErrnoException | string | null;

// 规定输入结果的接口 -- CLI
interface Results {
    url: string;
    path: string;
    limit: number;
}

// Worker下载参数 -- 漫画
interface WorkerDownloadParam {
    url: string;
}

// 回调函数 -- 模块
type CallbackFn = (err: ErrorSets, result?: Results) => void;

// 日志打印 -- 模块
const Logger = {
    err: (msg: ErrorSets): void => console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    warn: (msg: ErrorSets): void => console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    info: (msg: string): void => console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    done: (msg: string): void => console.log(`${chalk.bgGreen(' Done ')} ${msg}`),
    upd: (msg: string): void => console.log(`${chalk.bgYellow(' Update ')} ${msg}`),
    newLine: (lines: number): void => console.log('\n'.repeat(lines)),
    str: {
        err: (msg: ErrorSets): string => `${chalk.bgRed(' Error ')} ${msg}`,
        warn: (msg: ErrorSets): string => `${chalk.bgRed(' Warn ')} ${msg}`,
        info: (msg: string): string => `${chalk.bgBlue(' Info ')} ${msg}`,
        done: (msg: string): string => `${chalk.bgGreen(' Done ')} ${msg}`,
        upd: (msg: string): string => `${chalk.bgYellow(' Update ')} ${msg}`,
        prog: (msg: string): string => `${chalk.bgYellow(' Progress ')} ${msg}`,
    },
};

// 超时计时器 -- 漫画
class OutTimer {
    private readonly timerID: NodeJS.Timeout;

    public constructor(timeout: number, errorCode: string) {
        // 超时，结束进程
        this.timerID = setTimeout((): void => {
            Logger.err(`\n\nTimed out for ${timeout} seconds. [M-${errorCode}]`);
            process.exit(1);
        }, timeout * 1000);
    }

    // 成功，清除计时器
    public clear(): void {
        clearTimeout(this.timerID);
    }
}

// Axios响应数据
interface ResponseData {
    data: string;
}

// 文件下载参数
interface DownloadParams {
    url: string;
    path: string;
}

// 下载文件 -- 模块
function downloadImg(params: DownloadParams, callback: CallbackFn, config: AxiosRequestConfig = {}): void {
    const { url, path } = params;
    config.responseType = 'stream';
    const writer = fs.createWriteStream(path);
    axios
        .get(url, config)
        .then(({ data }): void => data.pipe(writer))
        .catch((err): void => callback(err));

    writer.on('finish', (): void => callback(null));
    writer.on('error', (): void => callback('error'));
}

// CLI界面和目录检查 -- 漫画
function prepare(site: string, callback: CallbackFn): void {
    cli(site, (err, result): void => {
        if (err) {
            callback(err + '[I-0x0003]');
        } else {
            checkPath(result.path, (err_1): void => {
                if (err_1) {
                    callback(err_1);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

export { WorkerDownloadParam, ResponseData, Results, CallbackFn, Logger, OutTimer, downloadImg, prepare };
