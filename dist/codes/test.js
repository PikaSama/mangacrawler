"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 实验性代码
 * License: MIT
 */
const axios_1 = require("axios");
const utils_1 = require("../modules/utils");
const cheerio = require("cheerio");
const fs = require("fs");
// const url = 'https://www.dm5.com/m170924'
// const url = 'https://m.mhxin.com/manhua/xianghemowangdarenjiehun/793549.html';
const url = "https://m.mhxin.com/manhua/xianghemowangdarenjiehun2/1084623.html";
axios_1.default
    .get(url, { timeout: 30000 })
    .then(({ data }) => {
    const $ = cheerio.load(data);
    fs.writeFile('test.html', data, (err) => {
        if (err) {
            utils_1.Logger.err(err);
        }
        else {
            utils_1.Logger.done('Done');
            const title = $('[name="keywords"]').attr('content').split(' ')[0];
            utils_1.Logger.info(title);
        }
    });
})
    .catch((err) => utils_1.Logger.err(err));
