"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
 * License: GPL-3.0
 */
const inquirer = require("inquirer");
const sites = [
    "www.dm5.com",
    "m.mhxin.com",
];
function main() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'site',
            message: "Which website do you want to download manga on ?",
            choices: sites,
        },
    ]).then(({ site }) => {
        switch (site) {
            case "www.dm5.com": {
                Promise.resolve().then(() => require('./sites/dm5')).then(({ dongmanwu }) => dongmanwu())
                    .catch((err) => console.log(err));
                break;
            }
            case "m.mhxin.com": {
                Promise.resolve().then(() => require('./sites/mhxin')).then(({ manhuaxin }) => manhuaxin())
                    .catch((err) => console.log(err));
                break;
            }
        }
    });
}
exports.main = main;
