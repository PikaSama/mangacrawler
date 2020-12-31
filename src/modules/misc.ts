/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 杂项模块
 * License: GPL-3.0
 */

import * as chalk from "chalk";

// 本地模块
import { cli } from "./cli";
import { checkPath } from "./dirCheck";

// Worker下载参数 -- 漫画
interface WorkerDownloadParam {
    url: string
}

// Worker回调函数 -- 漫画
interface WorkerCallbackFn {
    (err: Error, result?: number): void
}

// 规定输入结果的接口 -- CLI
interface Results {
    url: string,
    path: string,
    limit: number,
}

// 规定回调函数的接口 -- 模块
interface CallbackFn {
    (result?: Results): void
}

// 日志打印 -- 模块
const Logger = {
    errStr: (msg: string | NodeJS.ErrnoException): string => `${chalk.bgRed(' Error ')} ${msg}`,
    err: (msg: string | NodeJS.ErrnoException): void => console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    warnStr: (msg: string): string => `${chalk.bgRed(' Warn ')} ${msg}`,
    warn: (msg: string): void => console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    infoStr: (msg: string): string => `${chalk.bgBlue(' Info ')} ${msg}`,
    info: (msg: string): void => console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    succStr: (msg: string): string => `${chalk.bgGreen(' Success ')} ${msg}`,
    succ: (msg: string): void => console.log(`${chalk.bgGreen(' Success ')} ${msg}`),
    updStr: (msg: string): string => `${chalk.bgYellow(' Update ')} ${msg}`,
    upd: (msg: string): void => console.log(`${chalk.bgYellow(' Update ')} ${msg}`),
}

// 超时计时器 -- 漫画
class OutTimer {
    timerID: NodeJS.Timeout;
    constructor(timeout: number,errorCode: string) {
        // 超时，结束进程
        this.timerID = setTimeout((): void => {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} Timed out for ${timeout} secconds. [M-${errorCode}]`);
            process.exit(1);
        },timeout * 1000);
    }
    // 成功，清除计时器
    clear(): void {
        clearTimeout(this.timerID);
    }
}

// CLI界面和目录检查 -- 漫画
function prepare(site: string,callback: CallbackFn) {
    cli(site,(result): void => {
        checkPath(result.path,(): void => {
            callback(result);
        });
    });
}

export {
    WorkerDownloadParam,
    WorkerCallbackFn,
    Results,
    CallbackFn,
    Logger,
    OutTimer,
    prepare,
};