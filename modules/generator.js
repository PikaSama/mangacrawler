const ejs = require("ejs");
const fs = require("fs");
module.exports = genHTML;
function genHTML(pm) {
    ejs.renderFile('./template.ejs',{ imgs: pm.imgAmount },(err,data) => {
        if (err) {
            console.error("\033[41;37m Error \033[0m "+err+"\n");
        }
        else {
            try {
                const minify = require("html-minifier").minify;
                console.log("\033[44;37m Info \033[0m Found module: 'html-minifier'.\n");
                fs.writeFile(pm.path+'/manga.html',minify(data,{ collapseWhitespace:true, minifyCSS:true , minifyJS:true }),err1 => {
                    if (err1) {
                        console.error("\033[41;37m Error \033[0m "+err1+"\n");
                    }
                    else {
                        pm.dlTime = Math.round((new Date().getTime()-pm.dlTime)/100)/10+"s";
                        console.log("\033[42;37m Success \033[0m Manga has been downloaded in",pm.dlTime);
                    }
                });
            }
            catch (err) {
                console.log("\033[44;37m Info \033[0m Module 'html-minifier' was not installed. \n");
                fs.writeFile(pm.path+'/manga.html',data,err1 => {
                    if (err1) {
                        console.error("\033[41;37m Error \033[0m "+err1+"\n");
                    }
                    else {
                        pm.dlTime = Math.round((new Date().getTime()-pm.dlTime)/100)/10+"s";
                        console.log("\033[42;37m Success \033[0m Manga has been downloaded in",pm.dlTime);
                    }
                });
            }
        }
    });
}