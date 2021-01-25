/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: Yet another utils，另一个工具模块
 * License: MIT
 */

import { cli } from './cli';
import { checkPath } from './dirCheck';
import { CallbackFn } from './utils';

// CLI界面和目录检查 -- 漫画
function prepare(site: string, callback: CallbackFn): void {
    cli(site, (err, result): void => {
        if (err) {
            callback(err + '[I-0x0003]');
        } else {
            checkPath(result.path, (err_1): void => {
                if (err_1) {
                    callback(err_1);
                } else {
                    callback(null, result);
                }
            });
        }
    });
}

export { prepare };
