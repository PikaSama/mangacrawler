"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: html文件生成模块
 * License: GPL-3.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genHTML = void 0;
const html_minifier_1 = require("html-minifier");
const ejs = __importStar(require("ejs"));
const fs = __importStar(require("fs"));
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
                misc_1.Logger.succ(`Manga has been downloaded in ${opt.dlTime}s`);
            }
        });
    }
}
exports.genHTML = genHTML;
