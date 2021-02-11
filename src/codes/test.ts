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

// const url = 'https://www.dm5.com/m170924'
// const url = 'https://m.mhxin.com/manhua/xianghemowangdarenjiehun/793549.html';
const url = "https://m.mhxin.com/manhua/xianghemowangdarenjiehun2/1084623.html"
axios
    .get(url, { timeout: 30000 })
    .then(({ data }) => {
        const $ = cheerio.load(data);
        fs.writeFile('test.html', data, (err): void => {
            if (err) {
                Logger.err(err);
            } else {
                Logger.done('Done');
                const title = $('[name="keywords"]').attr('content').split(' ')[0];
                Logger.info(title);
            }
        });
    })
    .catch((err): void => Logger.err(err));
