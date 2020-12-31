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
    errStr: (msg) => `${chalk.bgRed(' Error ')} ${msg}`,
    err: (msg) => console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    warnStr: (msg) => `${chalk.bgRed(' Warn ')} ${msg}`,
    warn: (msg) => console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    infoStr: (msg) => `${chalk.bgBlue(' Info ')} ${msg}`,
    info: (msg) => console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    succStr: (msg) => `${chalk.bgGreen(' Success ')} ${msg}`,
    succ: (msg) => console.log(`${chalk.bgGreen(' Success ')} ${msg}`),
    updStr: (msg) => `${chalk.bgYellow(' Update ')} ${msg}`,
    upd: (msg) => console.log(`${chalk.bgYellow(' Update ')} ${msg}`),
};
exports.Logger = Logger;
// 超时计时器 -- 漫画
class OutTimer {
    constructor(timeout, errorCode) {
        // 超时，结束进程
        this.timerID = setTimeout(() => {
            console.error(`\n\n${chalk.whiteBright.bgRed(' Error ')} Timed out for ${timeout} secconds. [M-${errorCode}]`);
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
    cli_1.cli(site, (result) => {
        dirCheck_1.checkPath(result.path, () => {
            callback(result);
        });
    });
}
exports.prepare = prepare;
