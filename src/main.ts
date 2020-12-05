/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
 * License: GPL-3.0
 */
import * as inquirer from "inquirer";
import { prepare as dm5 } from "./sites/dm5";

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
]).then(({ site }): void => {
    switch (site) {
        case "www.dm5.com": {
            dm5();
            break;
        }
        case "m.mhxin.com": {
            console.log("Coming soon...")
            break;
        }
    }
});
