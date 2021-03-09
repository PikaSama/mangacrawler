"use strict";
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: CLI界面模块
 * License: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cli = void 0;
const inquirer = require("inquirer");
const os_1 = require("os");
const utils_1 = require("./utils");
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
        case 'dm5':
            dm5();
            break;
        case 'mhxin':
            mhxin();
            break;
        default:
            process.exit(1);
    }
    function dm5() {
        inquirer
            .prompt([
            {
                type: 'input',
                name: 'url',
                message: "Please enter the manga's URL :",
                validate(val) {
                    let blocks = val.split('/');
                    // 判断url包含的斜杠，仅需3个
                    if (blocks.length !== 4) {
                        return utils_1.Logger.str.err('Invalid URL format. [I-0x0101]');
                    }
                    // 判断协议是否合法
                    else if (blocks[0].match('http:') || blocks[0].match('https:')) {
                        // 判断第二个块是否无值
                        if (!(blocks[1] === '')) {
                            return utils_1.Logger.str.err('Invalid URL usage. [I-0x0103]');
                        }
                        // 判断网站是否正确 && 是否以'm'开头 && 是否包含分页符号“-”
                        else if (blocks[2] === 'www.dm5.com' &&
                            blocks[3].slice(0, 1) === 'm' &&
                            !blocks[3].match('-')) {
                            return true;
                        }
                        else {
                            return utils_1.Logger.str.err('Invalid domain or Manga ID. [I-0x0104]');
                        }
                    }
                    else {
                        return utils_1.Logger.str.err('Unsupported transmission protocol. [I-0x0102]');
                    }
                },
            },
        ])
            .then(({ url }) => {
            cliResults.url = url;
            defaultPrompts();
        })
            .catch((err) => callback(err));
    }
    function mhxin() {
        inquirer
            .prompt([
            {
                type: 'input',
                name: 'url',
                message: "Please enter the manga's URL :",
                validate(val) {
                    let blocks = val.split('/');
                    // 判断url包含的斜杠，仅需5个
                    if (blocks.length !== 6) {
                        return utils_1.Logger.str.err('Invalid URL format. [I-0x0201]');
                    }
                    // 判断协议是否合法
                    else if (blocks[0].match('http:') || blocks[0].match('https:')) {
                        // 判断第二个块是否有值 || 第五个块是否无值
                        if (!(blocks[1] === '') || blocks[4] === '') {
                            return utils_1.Logger.str.err('Invalid URL usage. [I-0x0203]');
                        }
                        // 判断网站是否正确 && 目录是否指向“manhua” && 后缀是否为“.html”
                        else if (blocks[2] === 'm.mhxin.com' &&
                            blocks[3] === 'manhua' &&
                            blocks[5].slice(-5) === '.html') {
                            return true;
                        }
                        else {
                            return utils_1.Logger.str.err('Invalid domain or resource directory or Manga ID. [I-0x0204]');
                        }
                    }
                    else {
                        return utils_1.Logger.str.err('Unsupported transmission protocol. [I-0x0202]');
                    }
                },
            },
        ])
            .then(({ url }) => {
            cliResults.url = url;
            defaultPrompts();
        })
            .catch((err) => callback(err));
    }
    function defaultPrompts() {
        inquirer
            .prompt([
            // 保存路径
            {
                type: 'input',
                name: 'path',
                message: 'Where do you want to save the manga? :',
                validate(val) {
                    // 判断末尾是否含斜杠
                    if (val.slice(-1) === '/' && val.length > 1) {
                        return utils_1.Logger.str.err('You don\'t need to add "/" at the end of the path. [I-0x0001]');
                    }
                    else {
                        return true;
                    }
                },
                filter(val) {
                    if (val.slice(0, 1) === '~') {
                        return home + val.slice(1);
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
                message: 'How many requests do you want to set to download the manga at a time?(1-16) :',
                validate(val) {
                    const parsedVal = parseInt(val, 10);
                    // 判断输入数字是否合法
                    if (parsedVal >= 1 && parsedVal <= 16) {
                        return true;
                    }
                    else {
                        return utils_1.Logger.str.err('Invalid number. [I-0x0002]');
                    }
                },
                filter(val) {
                    const parsedVal = parseInt(val, 10);
                    if (parsedVal >= 1 && parsedVal <= 16) {
                        return String(parsedVal);
                    }
                    else {
                        return String(parsedVal);
                    }
                },
            },
        ])
            .then(({ path, request }) => {
            cliResults.path = path;
            cliResults.limit = parseInt(request, 10);
            callback(null, cliResults);
        })
            .catch((err) => callback(err));
    }
}
exports.cli = cli;
