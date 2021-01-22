/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: CLI界面模块
 * License: GPL-3.0
 */

import * as inquirer from 'inquirer';

import cli from '../modules/cli';

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

cli('dm5', (err, result): void => {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
});
