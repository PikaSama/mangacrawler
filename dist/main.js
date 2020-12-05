"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
 * License: GPL-3.0
 */
const inquirer = require("inquirer");
const dm5_1 = require("./sites/dm5");
const sites = [
    "www.dm5.com",
    "m.mhxin.com",
];
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
            dm5_1.prepare();
            break;
        }
        case "m.mhxin.com": {
            console.log("Coming soon...");
            break;
        }
    }
});
