/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 工具模块
 * License: MIT
 */

import * as chalk from 'chalk';
// import { default as axios, AxiosRequestConfig } from 'axios';
import axios, { AxiosRequestConfig } from 'axios';

// 本地模块
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
    err: (msg: ErrorSets): void => console.log(`${chalk.bgRed(' ERROR ')} ${msg}`),
    warn: (msg: ErrorSets): void => console.log(`${chalk.bgRed(' WARN ')} ${msg}`),
    info: (msg: string): void => console.log(`${chalk.bgBlue(' INFO ')} ${msg}`),
    done: (msg: string): void => console.log(`${chalk.bgGreen(' DONE ')} ${msg}`),
    upd: (msg: string): void => console.log(`${chalk.bgYellow(' UPDATE ')} ${msg}`),
    debug: (msg: any): void => console.log(`${chalk.bgGray('DEBUG')}`, msg),
    newLine: (lines: number): void => console.log('\n'.repeat(lines)),
    str: {
        err: (msg: ErrorSets): string => `${chalk.bgRed(' ERROR ')} ${msg}`,
        warn: (msg: ErrorSets): string => `${chalk.bgRed(' WARN ')} ${msg}`,
        info: (msg: string): string => `${chalk.bgBlue(' INFO ')} ${msg}`,
        done: (msg: string): string => `${chalk.bgGreen(' DONE ')} ${msg}`,
        upd: (msg: string): string => `${chalk.bgYellow(' UPDATE ')} ${msg}`,
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

export { WorkerDownloadParam, ResponseData, Results, CallbackFn, Logger, OutTimer, downloadImg };
