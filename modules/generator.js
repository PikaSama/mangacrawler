const ejs = require("ejs");
const fs = require("fs");
function genHTML(opt) {
    ejs.renderFile('./template.ejs',{ imgs: opt.imgAmount },(err,data) => {
        if (err) {
            console.error("\033[41;37m Error \033[0m "+err+"\n");
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
                console.error("\033[41;37m Error \033[0m "+err+"\n");
            }
            else {
                opt.dlTime = Math.round((new Date().getTime()-opt.dlTime)/100)/10+"s";
                console.log("\033[42;37m Success \033[0m Manga has been downloaded in",opt.dlTime);
            }
        });
    }
}
module.exports = genHTML;