"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 目录检查模块
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPath = void 0;
const fs = require("fs");
const utils_1 = require("./utils");
function checkPath(savePath, callback) {
    fs.readdir(savePath, (err) => {
        if (err) {
            utils_1.Logger.warn(`"${savePath}" does not exist. Creating...`);
            mkdir();
        }
        else {
            utils_1.Logger.info(`Found directory: "${savePath}".\n`);
            readSplit();
        }
    });
    function readSplit() {
        fs.readdir(savePath + '/split', (err) => {
            if (err) {
                utils_1.Logger.warn(`"${savePath}/split" does not exist. Creating...`);
                mkSplit();
            }
            else {
                utils_1.Logger.info(`Found directory: "${savePath}/split".\n`);
                callback(null);
            }
        });
    }
    function mkdir() {
        fs.mkdir(savePath, (err) => {
            if (err) {
                callback(err + '[C-0x0001]\n');
            }
            else {
                utils_1.Logger.done('Created.\n');
                readSplit();
            }
        });
    }
    function mkSplit() {
        fs.mkdir(savePath + '/split', (err) => {
            if (err) {
                callback(err + '[C-0x0101]\n');
            }
            else {
                utils_1.Logger.done('Created.\n');
                callback(null);
            }
        });
    }
}
exports.checkPath = checkPath;
