/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 实验性代码
 * License: MIT
 */
import axios from 'axios';
import { Logger } from '../modules/utils';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

axios
    .get('https://www.dm5.com/m170924')
    .then(({ data }): void => {
        const $ = cheerio.load(data);
        const ele = $('head').children('script').last().html().split(';');
        console.log(ele);
        let resolvedVariables = 0;
        let cid = '';
        let mid = '';
        let viewSign = '';
        let viewSignDate = '';
        ele.map((val): string => {
            if (val.match('DM5_CID')) {
                cid = val.split('=')[1];
                resolvedVariables += 1;
            } else if (val.match('DM5_MID')) {
                mid = val.split('=')[1];
                resolvedVariables += 1;
            } else if (val.match('DM5_VIEWSIGN=')) {
                viewSign = val.split('"')[1];
                resolvedVariables += 1;
            } else if (val.match('DM5_VIEWSIGN_DT')) {
                viewSignDate = encodeURIComponent(val.split('"')[1]);
                resolvedVariables += 1;
            }
            return '';
        });
        Logger.info(`${[cid, mid, viewSign, viewSignDate]}`);
        if (resolvedVariables === 4) {
            Logger.info('All collected.');
        }
    })
    .catch((err): void => Logger.err(err));
