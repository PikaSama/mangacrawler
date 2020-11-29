const fs = require("fs");
function checkPath(savePath,callback) {
    fs.readdir(savePath,err => {
        if (err) {
            console.warn('\033[41;37m Warn \033[0m Directory "'+savePath+'" does not exist. Creating...');
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
                console.warn('\033[41;37m Warn \033[0m Directory "'+savePath+'/split" does not exist. Creating...');
                mkSplit();
            }
            else {
                console.log('\033[44;37m Info \033[0m Found directory: "'+savePath+'/split".\n');
                callback();
            }
        });
    }
    function mkdir() {
        fs.mkdir(savePath,err => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"[C-0x0001]\n");
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
                console.error("\033[41;37m Error \033[0m "+err+"[C-0x0101]\n");
            }
            else {
                console.log("\033[46;37m Succeed \033[0m Created.\n");
                callback();
            }
        });
    }
}
module.exports = checkPath;