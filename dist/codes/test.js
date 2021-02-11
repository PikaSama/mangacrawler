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
axios_1.default
    .get('https://m.mhxin.com/manhua/douluodalu4zhongjidouluo/1077515.html', { timeout: 30000 })
    .then(({ data }) => {
    const $ = cheerio.load(data);
    fs.writeFile('test.html', data, (err) => {
        if (err) {
            utils_1.Logger.err(err);
        }
        else {
            utils_1.Logger.done('Done');
        }
    });
})
    .catch((err) => utils_1.Logger.err(err));
