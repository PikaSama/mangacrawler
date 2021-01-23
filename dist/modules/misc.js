"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 杂项模块
 * License: GPL-3.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = exports.downloadImg = exports.OutTimer = exports.Logger = void 0;
const chalk = __importStar(require("chalk"));
const axios_1 = __importDefault(require("axios"));
// 本地模块
const cli_1 = __importDefault(require("./cli"));
const dirCheck_1 = require("./dirCheck");
const fs = __importStar(require("fs"));
// 日志打印 -- 模块
const Logger = {
    err: (msg) => console.log(`${chalk.bgRed(' Error ')} ${msg}`),
    warn: (msg) => console.log(`${chalk.bgRed(' Warn ')} ${msg}`),
    info: (msg) => console.log(`${chalk.bgBlue(' Info ')} ${msg}`),
    done: (msg) => console.log(`${chalk.bgGreen(' Done ')} ${msg}`),
    upd: (msg) => console.log(`${chalk.bgYellow(' Update ')} ${msg}`),
    str: {
        err: (msg) => `${chalk.bgRed(' Error ')} ${msg}`,
        warn: (msg) => `${chalk.bgRed(' Warn ')} ${msg}`,
        info: (msg) => `${chalk.bgBlue(' Info ')} ${msg}`,
        done: (msg) => `${chalk.bgGreen(' Done ')} ${msg}`,
        upd: (msg) => `${chalk.bgYellow(' Update ')} ${msg}`,
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
function downloadImg(url, path, config = {}, callback) {
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
// CLI界面和目录检查 -- 漫画
function prepare(site, callback) {
    cli_1.default(site, (err, result) => {
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
