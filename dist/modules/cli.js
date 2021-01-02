"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: CLI界面模块
 * License: GPL-3.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const inquirer = require("inquirer");
const os_1 = require("os");
const misc_1 = require("./misc");
// 家目录
const home = os_1.homedir();
// 输入结果
const cliResults = {
    url: '',
    path: '',
    limit: 0,
};
function cli(mgSite, callback) {
    switch (mgSite) {
        case "dm5":
            dm5();
            break;
        case "mhxin":
            mhxin();
            break;
    }
    function dm5() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'url',
                message: "Please enter the manga's URL :",
                validate(val) {
                    let blocks = val.split("/");
                    // 判断url包含的斜杠，仅需3个
                    if (blocks.length !== 4) {
                        return misc_1.Logger.errStr('Invalid URL format. [I-0x0101]');
                    }
                    // 判断协议是否合法
                    else if (blocks[0].match("http:") || blocks[0].match("https:")) {
                        // 判断第二个块是否无值
                        if (!(blocks[1] === '')) {
                            return misc_1.Logger.errStr('Invalid URL usage. [I-0x0103]');
                        }
                        // 判断网站是否正确 && 是否以'm'开头 && 是否包含分页符号“-”
                        else if (blocks[2] === "www.dm5.com" && blocks[3].slice(0, 1) === "m" && !(blocks[3].match("-"))) {
                            return true;
                        }
                        else {
                            return misc_1.Logger.errStr('Invalid domain or Manga ID. [I-0x0104]');
                        }
                    }
                    else {
                        return misc_1.Logger.errStr('Unsupported transport protocol. [I-0x0102]');
                    }
                },
            },
        ]).then(({ url }) => {
            cliResults.url = url;
            defaultPrompts();
        }).catch((err) => callback(err));
    }
    function mhxin() {
        inquirer.prompt([
            {
                type: 'input',
                name: 'url',
                message: "Please enter the manga's URL :",
                validate(val) {
                    let blocks = val.split("/");
                    // 判断url包含的斜杠，仅需5个
                    if (blocks.length !== 6) {
                        return misc_1.Logger.errStr('Invalid URL format. [I-0x0201]');
                    }
                    // 判断协议是否合法
                    else if (blocks[0].match("http:") || blocks[0].match("https:")) {
                        // 判断第二个块是否有值 || 第五个块是否无值
                        if (!(blocks[1] === '') || blocks[4] === '') {
                            return misc_1.Logger.errStr('Invalid URL usage. [I-0x0203]');
                        }
                        // 判断网站是否正确 && 目录是否指向“manhua” && 后缀是否为“.html”
                        else if (blocks[2] === "m.mhxin.com" && blocks[3] === "manhua" && blocks[5].slice(-5) === ".html") {
                            return true;
                        }
                        else {
                            return misc_1.Logger.errStr('Invalid domain or resource directory or Manga ID. [I-0x0204]');
                        }
                    }
                    else {
                        return misc_1.Logger.errStr('Unsupported transport protocol. [I-0x0202]');
                    }
                },
            },
        ]).then(({ url }) => {
            cliResults.url = url;
            defaultPrompts();
        }).catch((err) => callback(err));
    }
    function defaultPrompts() {
        inquirer.prompt([
            // 保存路径
            {
                type: 'input',
                name: 'path',
                message: "Please enter the path to save it :",
                validate(val) {
                    // 判断末尾是否含斜杠
                    if (val.slice(-1) === "/" && val.length > 1) {
                        return misc_1.Logger.errStr('You don\'t need to add "/" at the end of the path. [I-0x0001]');
                    }
                    else {
                        return true;
                    }
                },
                filter(val) {
                    if (val.slice(0, 1) === "~") {
                        val = home + val.slice(1);
                        return val;
                    }
                    else {
                        return val;
                    }
                },
            },
            // 下载请求限制
            {
                type: 'input',
                name: 'request',
                message: "Download requests limit (1-16) :",
                validate(val) {
                    // 判断输入数字是否合法
                    if (val >= 1 && val <= 16) {
                        return true;
                    }
                    else {
                        return misc_1.Logger.errStr('Invalid number. [I-0x0002]');
                    }
                },
                filter(val) {
                    // 防止因parseInt处理的数据导致无法重新输入，仅在true时返回
                    if (val >= 1 && val <= 16) {
                        return ~~val;
                    }
                    else {
                        return val;
                    }
                },
            },
        ]).then(({ path, request }) => {
            cliResults.path = path;
            cliResults.limit = request;
            callback(null, cliResults);
        }).catch((err) => callback(err));
    }
}
exports.cli = cli;
