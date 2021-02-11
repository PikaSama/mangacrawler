/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 进度条模块，参考于：https://www.jianshu.com/p/00d8f71d367d
 * License: MIT
 */

import { stdout as slog } from 'single-line-log';
import { bgWhiteBright as chalk } from 'chalk';

class ProgressBar {
    private readonly description: string;
    private readonly length: number;

    // eslint-disable-next-line no-undef
    public constructor(bar_length = 25, bar_description = chalk.bgYellow(' PROGRESS ')) {
        this.description = bar_description;
        this.length = bar_length;
    }

    public render(completed: number, total: number): void {
        // 计算进度(子任务的 完成数 除以 总数)
        const percent: number = parseFloat((completed / total).toFixed(4));
        // 计算需要多少个 █ 符号来拼凑图案
        const cell_num: number = Math.floor(percent * this.length);
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
        slog(cmdText);
    }
    public clear() {
        slog.clear();
    }
}

export { ProgressBar };
