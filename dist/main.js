"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
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
const inquirer_1 = __importDefault(require("inquirer"));
// 支持的漫画站点
const sites = ['www.dm5.com', 'm.mhxin.com'];
inquirer_1.default
    .prompt([
    {
        type: 'list',
        name: 'site',
        message: 'Which website do you want to download manga on ?',
        choices: sites,
    },
])
    .then(({ site }) => {
    switch (site) {
        case 'www.dm5.com': {
            Promise.resolve().then(() => __importStar(require('./sites/dm5'))).then(({ dongmanwu }) => dongmanwu()).catch((err) => console.log(err));
            break;
        }
        case 'm.mhxin.com': {
            Promise.resolve().then(() => __importStar(require('./sites/mhxin'))).then(({ manhuaxin }) => manhuaxin())
                .catch((err) => console.log(err));
            break;
        }
        default:
            process.exit(1);
    }
});
