/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 目录检查模块
 * License: GPL-3.0
 */

import * as fs from 'fs';

import { CallbackFn, Logger } from './utils';

function checkPath(savePath: string, callback: CallbackFn): void {
    fs.readdir(savePath, (err): void => {
        if (err) {
            Logger.warn(`"${savePath}" does not exist. Creating...`);
            mkdir();
        } else {
            Logger.info(`Found directory: "${savePath}".\n`);
            readSplit();
        }
    });

    function readSplit() {
        fs.readdir(savePath + '/split', (err): void => {
            if (err) {
                Logger.warn(`"${savePath}/split" does not exist. Creating...`);
                mkSplit();
            } else {
                Logger.info(`Found directory: "${savePath}/split".\n`);
                callback(null);
            }
        });
    }

    function mkdir() {
        fs.mkdir(savePath, (err): void => {
            if (err) {
                callback(err + '[C-0x0001]\n');
            } else {
                Logger.done('Created.\n');
                readSplit();
            }
        });
    }

    function mkSplit() {
        fs.mkdir(savePath + '/split', (err): void => {
            if (err) {
                callback(err + '[C-0x0101]\n');
            } else {
                Logger.done('Created.\n');
                callback(null);
            }
        });
    }
}

export { checkPath };
