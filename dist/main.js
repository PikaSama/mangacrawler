"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
// 支持的漫画站点
const sites = ['www.dm5.com', 'm.mhxin.com'];
inquirer
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
            Promise.resolve().then(() => require('./sites/dm5')).then(({ dongmanwu }) => dongmanwu()).catch((err) => console.log(err));
            break;
        }
        case 'm.mhxin.com': {
            Promise.resolve().then(() => require('./sites/mhxin')).then(({ manhuaxin }) => manhuaxin())
                .catch((err) => console.log(err));
            break;
        }
        default:
            process.exit(1);
    }
});
