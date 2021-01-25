"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 进度条模块，参考于：https://www.jianshu.com/p/00d8f71d367d
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const single_line_log_1 = require("single-line-log");
const chalk_1 = require("chalk");
class ProgressBar {
    // eslint-disable-next-line no-undef
    constructor(bar_length = 25, bar_description = chalk_1.bgWhiteBright.bgYellow(' PROGRESS ')) {
        this.description = bar_description;
        this.length = bar_length;
    }
    render(completed, total) {
        // 计算进度(子任务的 完成数 除以 总数)
        const percent = parseFloat((completed / total).toFixed(4));
        // 计算需要多少个 █ 符号来拼凑图案
        const cell_num = Math.floor(percent * this.length);
        // 拼接黑色条
        let cell = '';
        for (let i = 0; i < cell_num; i++) {
            cell += '█';
        }
        // 拼接灰色条
        let empty = '';
        for (let i = 0; i < this.length - cell_num; i++) {
            empty += '░';
        }
        // 拼接最终文本
        const cmdText = `${this.description} ${(100 * percent).toFixed(2)}% ${cell}${empty} ${completed}/${total}`;
        // 在单行输出文本
        single_line_log_1.stdout(cmdText);
    }
    clear() {
        single_line_log_1.stdout.clear();
    }
}
exports.ProgressBar = ProgressBar;
