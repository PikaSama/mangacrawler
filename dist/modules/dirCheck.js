"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 目录检查模块
 * License: GPL-3.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPath = void 0;
const fs_1 = __importDefault(require("fs"));
const misc_1 = require("./misc");
function checkPath(savePath, callback) {
    fs_1.default.readdir(savePath, (err) => {
        if (err) {
            misc_1.Logger.warn(`"${savePath}" does not exist. Creating...`);
            mkdir();
        }
        else {
            misc_1.Logger.info(`Found directory: "${savePath}".\n`);
            readSplit();
        }
    });
    function readSplit() {
        fs_1.default.readdir(savePath + '/split', (err) => {
            if (err) {
                misc_1.Logger.warn(`"${savePath}/split" does not exist. Creating...`);
                mkSplit();
            }
            else {
                misc_1.Logger.info(`Found directory: "${savePath}/split".\n`);
                callback(null);
            }
        });
    }
    function mkdir() {
        fs_1.default.mkdir(savePath, (err) => {
            if (err) {
                callback(err + '[C-0x0001]\n');
            }
            else {
                misc_1.Logger.succ('Created.\n');
                readSplit();
            }
        });
    }
    function mkSplit() {
        fs_1.default.mkdir(savePath + '/split', (err) => {
            if (err) {
                callback(err + '[C-0x0101]\n');
            }
            else {
                misc_1.Logger.succ('Created.\n');
                callback(null);
            }
        });
    }
}
exports.checkPath = checkPath;
