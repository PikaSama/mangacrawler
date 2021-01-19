"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 目录检查模块
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPath = void 0;
const fs = __importStar(require("fs"));
const misc_1 = require("./misc");
function checkPath(savePath, callback) {
    fs.readdir(savePath, (err) => {
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
        fs.readdir(savePath + '/split', (err) => {
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
        fs.mkdir(savePath, (err) => {
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
        fs.mkdir(savePath + '/split', (err) => {
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
