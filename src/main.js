/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
 * License: GPL-3.0
 */
const inquirer = require("inquirer");
inquirer.prompt([
    {
        type: 'list',
        name: 'site',
        message: "Which website do you want to download manga on ?",
        choices: [
            "www.dm5.com",
            "m.mhxin.com",
        ],
    },
]).then(({ site }) => {
    switch (site) {
        case "www.dm5.com": {
            const dm5 = require("./sites/dm5JS");
            dm5();
            break;
        }
        case "m.mhxin.com": {
            const mhxin = require("./sites/mhxin");
            mhxin();
            break;
        }
    }
});