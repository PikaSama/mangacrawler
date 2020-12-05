/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: html文件生成模块
 * License: GPL-3.0
 */

import { minify } from 'html-minifier';
import * as ejs from 'ejs';
import * as chalk from 'chalk';
import * as fs from 'fs';

function genHTML(opt: {
    imgAmount: number,
    path: string,
    dlTime: number,
}) {
    ejs.renderFile('./template/template.ejs',{ imgs: opt.imgAmount },(err,data) => {
        if (err) {
            console.error(`${chalk.whiteBright.bgRed(' Error ')} ${err} [G-0x0001]\n`);
        }
        else {
            writeHTML(minify(data, {
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
            }));
        }
    });
    function writeHTML(data) {
        fs.writeFile(opt.path+'/manga.html',data,err => {
            if (err) {
                console.error(`${chalk.whiteBright.bgRed(' Error ')} ${err} [G-0x0101]\n`);
            }
            else {
                opt.dlTime = Math.round((new Date().getTime()-opt.dlTime)/100)/10;
                console.log(`${chalk.whiteBright.bgGreen(' Success ')} Manga has been downloaded in ${opt.dlTime}s`);
            }
        });
    }
}

export { genHTML };
