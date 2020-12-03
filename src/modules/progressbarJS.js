const slog = require('single-line-log').stdout;
/**
 * @source: https://www.jianshu.com/p/00d8f71d367d
 * @description: 封装的Progressbar，用以在同一行打印文本
 * @param description {(number | null | undefined)} 命令行开头的文字信息
 * @param bar_length {(number | null | undefined)} 进度条的长度(单位：字符)，默认设为 25
 * @constructor
 */
function ProgressbarJS(description, bar_length){
    // 两个基本参数(属性)
    this.description = description || '\033[43;37m Progress \033[0m';
    this.length = bar_length || 25;
    // 刷新进度条图案、文字的方法
    this.render = function (opts){
        // 计算进度(子任务的 完成数 除以 总数)
        const percent = (opts.completed / opts.total).toFixed(4);
        // 计算需要多少个 █ 符号来拼凑图案
        const cell_num = Math.floor(percent * this.length);
        // 拼接黑色条
        let cell = '';
        for (let i=0;i<cell_num;i++) {
            cell += '█';
        }
        // 拼接灰色条
        let empty = '';
        for (let i=0;i<this.length-cell_num;i++) {
            empty += '░';
        }
        // 拼接最终文本
        const cmdText = this.description + ' ' + (100*percent).toFixed(2) + '% ' + cell + empty + ' ' + opts.completed + '/' + opts.total;
        // 在单行输出文本
        slog(cmdText);
    };
}
// 模块导出
module.exports = ProgressbarJS;