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
    (err: NodeJS.ErrnoException | string | null, result?: number): void
}

// 规定回调函数的接口 -- 模块
interface CallbackFn {
    (err: NodeJS.ErrnoException | string | null,result?: Results): void
}

// 日志打印 -- 模块
const Logger = {
    err: (msg: string | NodeJS.ErrnoException): void => console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    errStr: (msg: string | NodeJS.ErrnoException): string => `${chalk.bgRed(' Error ')} ${msg}`,
    warn: (msg: string): void => console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    warnStr: (msg: string): string => `${chalk.bgRed(' Warn ')} ${msg}`,
    info: (msg: string): void => console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    infoStr: (msg: string): string => `${chalk.bgBlue(' Info ')} ${msg}`,
    succ: (msg: string): void => console.log(`${chalk.bgGreen(' Success ')} ${msg}`),
    succStr: (msg: string): string => `${chalk.bgGreen(' Success ')} ${msg}`,
    upd: (msg: string): void => console.log(`${chalk.bgYellow(' Update ')} ${msg}`),
    updStr: (msg: string): string => `${chalk.bgYellow(' Update ')} ${msg}`,
    prog: (msg: string): string => `${chalk.bgYellow(' Progress  ')} ${msg}`,
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
    Logger,
    OutTimer,
    prepare,
};