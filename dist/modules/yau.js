"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: Yet another utils，另一个工具模块
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = void 0;
const cli_1 = require("./cli");
const dirCheck_1 = require("./dirCheck");
// CLI界面和目录检查 -- 漫画
function prepare(site, callback) {
    cli_1.cli(site, (err, result) => {
        if (err) {
            callback(err + '[I-0x0003]');
        }
        else {
            dirCheck_1.checkPath(result.path, (err_1) => {
                if (err_1) {
                    callback(err_1);
                }
                else {
                    callback(null, result);
                }
            });
        }
    });
}
exports.prepare = prepare;
