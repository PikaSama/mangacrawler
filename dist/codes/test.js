"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: CLI界面模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const cli_1 = require("../modules/cli");
inquirer.prompt([
    {
        name: 'a',
        type: 'input',
        validate(val) {
            console.log('\na:', typeof val);
        },
        filter(val) {
            console.log('\na:', typeof val);
        },
    },
]);
cli_1.default('dm5', (err, result) => {
    if (err) {
        console.error(err);
    }
    else {
        console.log(result);
    }
});
