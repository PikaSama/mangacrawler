"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 杂项模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = exports.OutTimer = exports.Logger = void 0;
const chalk = require("chalk");
// 本地模块
const cli_1 = require("./cli");
const dirCheck_1 = require("./dirCheck");
// 日志打印 -- 模块
const Logger = {
    err: (msg) => console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    errStr: (msg) => `${chalk.bgRed(' Error ')} ${msg}`,
    warn: (msg) => console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    warnStr: (msg) => `${chalk.bgRed(' Warn ')} ${msg}`,
    info: (msg) => console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    infoStr: (msg) => `${chalk.bgBlue(' Info ')} ${msg}`,
    succ: (msg) => console.log(`${chalk.bgGreen(' Success ')} ${msg}`),
    succStr: (msg) => `${chalk.bgGreen(' Success ')} ${msg}`,
    upd: (msg) => console.log(`${chalk.bgYellow(' Update ')} ${msg}`),
    updStr: (msg) => `${chalk.bgYellow(' Update ')} ${msg}`,
    prog: (msg) => `${chalk.bgYellow(' Progress  ')} ${msg}`,
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
// CLI界面和目录检查 -- 漫画
function prepare(site, callback) {
    cli_1.cli(site, (err, result) => {
        if (err) {
            callback(err + '[I-0x0003]');
        }
        else {
            dirCheck_1.checkPath(result.path, (err_1) => {
                if (err_1) {
                    callback(err_1);
                }
                else {
                    callback(null, result);
                }
            });
        }
    });
}
exports.prepare = prepare;
