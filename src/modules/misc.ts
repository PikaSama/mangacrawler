/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 杂项模块
 * License: GPL-3.0
 */

import * as chalk from "chalk";
import axios, { AxiosRequestConfig } from "axios";

// 本地模块
import { cli } from "./cli";
import { checkPath } from "./dirCheck";
import * as fs from "fs";

// 错误内容
type ErrorSets = NodeJS.ErrnoException | string | null;

// 布尔值和数字的联合类型，用于条件判断
type BooleanSets = boolean | number;

// 日志打印模块的返回值
type LoggerResult = void | string;

// 规定输入结果的接口 -- CLI
interface Results {
    url: string,
    path: string,
    limit: number,
}

// Worker下载参数 -- 漫画
interface WorkerDownloadParam {
    url: string
}

// Worker回调函数 -- 漫画
interface WorkerCallbackFn {
    (err: ErrorSets, result?: number): void
}

// 规定回调函数的接口 -- 模块
interface CallbackFn {
    (err: ErrorSets,result?: Results): void
}

// 日志打印 -- 模块
const Logger = {
    err: (msg: string | NodeJS.ErrnoException,returnStr?: BooleanSets): LoggerResult => returnStr ? `${chalk.bgRed(' Error ')} ${msg}` : console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    warn: (msg: string,returnStr?: BooleanSets): LoggerResult => returnStr ? `${chalk.bgRed(' Warn ')} ${msg}` : console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    info: (msg: string,returnStr?: BooleanSets): LoggerResult => returnStr ? `${chalk.bgBlue(' Info ')} ${msg}` : console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    succ: (msg: string,returnStr?: BooleanSets): LoggerResult => returnStr ? `${chalk.bgGreen(' Success ')} ${msg}` : console.log(`${chalk.bgGreen(' Success ')} ${msg}`),
    prog: (msg: string,returnStr?: BooleanSets): LoggerResult => returnStr ? `${chalk.bgYellow(' Progress ')} ${msg}` : console.log(`${chalk.bgYellow(' Progress ')} ${msg}`),
    newLine: (line: number): void => {
        for (let i = 0;i < line;i++) {
            console.log('\n');
        }
    }
}

// 超时计时器 -- 漫画
class OutTimer {
    timerID: NodeJS.Timeout;

    constructor(timeout: number,errorCode: string) {
        // 超时，结束进程
        this.timerID = setTimeout((): void => {
            Logger.err(`\n\nTimed out for ${timeout} seconds. [M-${errorCode}]`);
            process.exit(1);
        },timeout * 1000);
    }

    // 成功，清除计时器
    clear(): void {
        clearTimeout(this.timerID);
    }
}

// 下载文件 -- 模块
function downloadImg(url: string,path: string,config: AxiosRequestConfig = {},callback: CallbackFn): void {
    config.responseType = 'stream';
    const writer: fs.WriteStream = fs.createWriteStream(path);
    axios.get(url,config).then(({ data }): void => data.pipe(writer)).catch((err): void => callback(err));
    writer.on("finish",(): void => callback(null));
    writer.on("error",(): void => callback('error'));
}

// CLI界面和目录检查 -- 漫画
function prepare(site: string,callback: CallbackFn): void {
    cli(site,(err,result): void => {
        if (err) {
            callback(err + '[I-0x0003]');
        }
        else {
            checkPath(result.path,(err_1): void => {
                if (err_1) {
                    callback(err_1);
                }
                else {
                    callback(null,result);
                }
            });
        }
    });
}

export {
    WorkerDownloadParam,
    WorkerCallbackFn,
    Results,
    CallbackFn,
    ErrorSets,
    Logger,
    OutTimer,
    downloadImg,
    prepare,
};