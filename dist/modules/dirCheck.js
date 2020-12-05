"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 目录检查模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPath = void 0;
const fs = require("fs");
const chalk = require("chalk");
function checkPath(savePath, callback) {
    fs.readdir(savePath, err => {
        if (err) {
            console.warn(`${chalk.whiteBright.bgRed(' Warn ')} "${savePath}" does not exist. Creating...`);
            mkdir();
        }
        else {
            console.log(`${chalk.whiteBright.bgBlue(' Info ')} Found directory: "${savePath}".\n`);
            readSplit();
        }
    });
    function readSplit() {
        fs.readdir(savePath + '/split', err => {
            if (err) {
                console.warn(`${chalk.whiteBright.bgRed(' Warn ')} "${savePath}/split" does not exist. Creating...`);
                mkSplit();
            }
            else {
                console.log(`${chalk.whiteBright.bgBlue(' Info ')} Found directory: "${savePath}/split".\n`);
                callback();
            }
        });
    }
    function mkdir() {
        fs.mkdir(savePath, err => {
            if (err) {
                console.error(`${chalk.whiteBright.bgRed(' Error ')} ${err} [C-0x0001]\n`);
            }
            else {
                console.log(`${chalk.whiteBright.bgGreen(' Success ')} Created.\n`);
                readSplit();
            }
        });
    }
    function mkSplit() {
        fs.mkdir(savePath + '/split', err => {
            if (err) {
                console.error(`${chalk.whiteBright.bgRed(' Error ')} ${err} [C-0x0101]\n`);
            }
            else {
                console.log(`${chalk.whiteBright.bgGreen(' Success ')} Created.\n`);
                callback();
            }
        });
    }
}
exports.checkPath = checkPath;
