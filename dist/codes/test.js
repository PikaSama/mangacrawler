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
axios_1.default
    .get('https://www.dm5.com/m170924')
    .then(({ data }) => {
    const $ = cheerio.load(data);
    const ele = $('head').children('script').last().html().split(';');
    console.log(ele);
    let resolvedVariables = 0;
    let cid = '';
    let mid = '';
    let viewSign = '';
    let viewSignDate = '';
    ele.map((val) => {
        if (val.match('DM5_CID')) {
            cid = val.split('=')[1];
            resolvedVariables += 1;
        }
        else if (val.match('DM5_MID')) {
            mid = val.split('=')[1];
            resolvedVariables += 1;
        }
        else if (val.match('DM5_VIEWSIGN=')) {
            viewSign = val.split('"')[1];
            resolvedVariables += 1;
        }
        else if (val.match('DM5_VIEWSIGN_DT')) {
            viewSignDate = encodeURIComponent(val.split('"')[1]);
            resolvedVariables += 1;
        }
        return '';
    });
    utils_1.Logger.info(`${[cid, mid, viewSign, viewSignDate]}`);
    if (resolvedVariables === 4) {
        utils_1.Logger.info('All collected.');
    }
})
    .catch((err) => utils_1.Logger.err(err));
