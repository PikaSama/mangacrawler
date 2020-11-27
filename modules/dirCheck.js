const fs = require("fs");
const dm5 = require("../mangaSites/dm5")
function checkPath(savePath,mgSite) {
    fs.readdir(savePath+'',err => {
        if (err) {
            console.warn('\033[41;37m Warn \033[0m Directory "'+savePath+'" doesn\'t exist. Creating...');
            mkdir();
        }
        else {
            console.log('\033[44;37m Info \033[0m Found directory: "'+savePath+'".\n');
            readSplit();
        }
    });
    function readSplit() {
        fs.readdir(savePath+'/split',err => {
            if (err) {
                console.warn('\033[41;37m Warn \033[0m Directory "'+savePath+'/split" doesn\'t exist. Creating...');
                mkSplit();
            }
            else {
                console.log('\033[44;37m Info \033[0m Found directory: "'+savePath+'/split".\n');
                callbacks();
            }
        });
    }
    function mkdir() {
        fs.mkdir(savePath+'',err => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"\n");
            }
            else {
                console.log("\033[46;37m Succeed \033[0m Created.\n");
                readSplit();
            }
        });
    }
    function mkSplit() {
        fs.mkdir(savePath+'/split',err => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"\n");
            }
            else {
                console.log("\033[46;37m Succeed \033[0m Created.\n");
                callbacks();
            }
        });
    }
    function callbacks() {
        if (mgSite === "dm5") {
            dm5().catch(err => {
                //  发生错误，结束浏览器进程
                console.error("\n\033[41;37m Error \033[0m "+err+"\n");
                process.exit(1);
            });
        }
    }
}
module.exports = checkPath;