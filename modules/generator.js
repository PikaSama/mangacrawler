const ejs = require("ejs");
const fs = require("fs");
/**
 * @author Zorin
 * @license GPL-3.0
 * @project Spider-Manga
 * @github https://github.com/PikaSama
 * @description html文件（完整漫画）生成模块
 * @param opt {object} 生成html的参数
 * @property {number} opt.imgAmount 图片数量
 * @property {string} opt.path 文件生成路径
 * @property {number} opt.dlTime 用于计算下载时间的变量
 */
function genHTML(opt) {
    ejs.renderFile('./template.ejs',{ imgs: opt.imgAmount },(err,data) => {
        if (err) {
            console.error("\033[41;37m Error \033[0m "+err+"[G-0x0001]\n");
        }
        else {
            try {
                const minify = require("html-minifier").minify;
                console.log("\033[44;37m Info \033[0m Found module: 'html-minifier'.\n");
                writeHTML(minify(data, {
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                }));
            }
            catch (err) {
                console.log("\033[44;37m Info \033[0m Module 'html-minifier' was not installed. \n");
                writeHTML(data);
            }
        }
    });
    function writeHTML(data) {
        fs.writeFile(opt.path+'/manga.html',data,err => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"[G-0x0101]\n");
            }
            else {
                opt.dlTime = Math.round((new Date().getTime()-opt.dlTime)/100)/10;
                console.log("\033[42;37m Success \033[0m Manga has been downloaded in",opt.dlTime+"s");
            }
        });
    }
}
module.exports = genHTML;