"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 杂项模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = exports.OutTimer = void 0;
const chalk = require("chalk");
// 本地模块
const cli_1 = require("./cli");
const dirCheck_1 = require("./dirCheck");
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
