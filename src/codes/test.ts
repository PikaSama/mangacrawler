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
    .get('https://m.mhxin.com/manhua/douluodalu4zhongjidouluo/1077515.html', { timeout: 30000 })
    .then(({ data }) => {
        const $ = cheerio.load(data);
        fs.writeFile('test.html', data, (err): void => {
            if (err) {
                Logger.err(err);
            } else {
                Logger.done('Done');
            }
        });
    })
    .catch((err): void => Logger.err(err));
