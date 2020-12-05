/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 进度条模块，参考于：https://www.jianshu.com/p/00d8f71d367d
 * License: GPL-3.0
 */

import { stdout as slog } from "single-line-log";
import * as chalk from 'chalk';

class ProgressBar {
    description: string;
    length: number;
    constructor(description: string = `${chalk.whiteBright.bgYellow(' Progress  ')}`, bar_length: number = 25) {
        this.description = description;
        this.length = bar_length;
    }
    render(completed: number,total: number): void {
        // 计算进度(子任务的 完成数 除以 总数)
        const percent: number = parseFloat((completed / total).toFixed(4));
        // 计算需要多少个 █ 符号来拼凑图案
        const cell_num: number = Math.floor(percent * this.length);
        // 拼接黑色条
        let cell: string = '';
        for (let i = 0;i < cell_num;i++) {
            cell += '█';
        }
        // 拼接灰色条
        let empty: string = '';
        for (let i = 0;i < this.length - cell_num;i++) {
            empty += '░';
        }
        // 拼接最终文本
        const cmdText: string = `${this.description} ${(100 * percent).toFixed(2)}% ${cell}${empty} ${completed}/${total}`;
        // 在单行输出文本
        slog(cmdText);
    }
}

export { ProgressBar };
