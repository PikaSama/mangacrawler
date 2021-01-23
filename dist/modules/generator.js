"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: html文件生成模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.genHTML = void 0;
const html_minifier_1 = require("html-minifier");
const ejs = require("ejs");
const fs = require("fs");
const misc_1 = require("./misc");
function genHTML(opt) {
    ejs.renderFile('./template/template.ejs', { imgs: opt.imgAmount }, (err, data) => {
        if (err) {
            misc_1.Logger.err(`${err} [G-0x0001]\n`);
        }
        else {
            writeHTML(html_minifier_1.minify(data, {
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true,
            }));
        }
    });
    function writeHTML(data) {
        fs.writeFile(opt.path + '/manga.html', data, (err) => {
            if (err) {
                misc_1.Logger.err(`${err} [G-0x0101]\n`);
            }
            else {
                opt.dlTime = Math.round((new Date().getTime() - opt.dlTime) / 100) / 10;
                misc_1.Logger.done(`Manga has been downloaded in ${opt.dlTime}s`);
            }
        });
    }
}
exports.genHTML = genHTML;
