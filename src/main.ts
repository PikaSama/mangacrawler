/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 主要模块（桥接模块），漫画站点选择菜单
 * License: GPL-3.0
 */
import * as inquirer from "inquirer";

const sites: string[] = [
    "www.dm5.com",
    "m.mhxin.com",
];

function main(): void {
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
                import('./sites/dm5')
                    .then(({ dongmanwu }): void => dongmanwu())
                    .catch((err): void => console.log(err));
                break;
            }
            case "m.mhxin.com": {
                import('./sites/mhxin')
                    .then(({ manhuaxin }): void => manhuaxin())
                    .catch((err): void => console.log(err));
                break;
            }
        }
    });
}

export { main };