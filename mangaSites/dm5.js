// 解决循环依赖，在require前导出
module.exports = getMangaInfo;
// 依赖
const axios = require("axios");
let puppeteer;
try {
    puppeteer = require("puppeteer");
    console.log("\033[44;37m Info \033[0m Found module : 'puppeteer'.\n");
    cli();
}
catch (err) {
    console.error("\033[41;37m Error \033[0m Could not find module 'puppeteer', have you already installed it ? [0x0001\n]");
}
const async = require("async");
const inquirer = require("inquirer");
// Node API
const home = require("os").homedir();
const fs = require("fs");
// 本地模块
const checkPath = require("../modules/dirCheck");
const generateManga = require("../modules/generator");
const ProgressBar = require("../modules/progressbar");
// 输入项
let mangaUrl;
let savePath;
let crawlLimit;
// 变量
let crawlList = [];
let info = {};
let dlTime;
// 节点列表
const nodeList = [
    "112-53-225-216.cdndm5.com",
    "101-69-161-98.cdndm5.com",
    "101-69-161-99.cdndm5.com",
    "61-174-50-98.cdndm5.com",
    "61-174-50-99.cdndm5.com",
    "104-250-139-219.cdnmanhua.net",
    "104-250-150-12.cdnmanhua.net"
];
// CLI交互界面
function cli() {
    inquirer.prompt([
        // 漫画url
        {
            type:'input',
            name: 'url',
            message: "Please enter the manga's URL :",
            validate: val => {
                let blocks = val.split("/");
                // 判断url包含的斜杠，至少需3个
                if (blocks.length < 4) {
                    return "\033[41;37m Error \033[0m Invalid URL format. [0x0101]";
                }
                // 判断协议是否合法
                else if (blocks[0].match("http:") || blocks[0].match("https:")) {
                    // 判断第一个斜杠与第二个之间是否无值
                    if (!(blocks[1] === '')) {
                        return "\033[41;37m Error \033[0m Invalid URL. [0x0103]";
                    }
                    // 判断末尾是否有斜杠
                    else if (val.slice(-1) === "/") {
                        return '\033[41;37m Error \033[0m You dont need to add "/" at the end of the URL. [0x0104]';
                    }
                    // 判断网站是否正确 && 是否以'm'+'xxxxx'结尾 && 是否包含分页符号“-”
                    else if (blocks[2].match("www.dm5.com") && blocks[3].slice(0,1) === "m" && !(blocks[3].match("-"))){
                        return true;
                    }
                    else {
                        return "\033[41;37m Error \033[0m Invalid domain or Manga ID. [0x0105]";
                    }
                }
                else {
                    return "\033[41;37m Error \033[0m Unsupported transport protocol. [0x0102]";
                }
            }
        },
        // 保存路径
        {
            type:'input',
            name: 'path',
            message: "Please enter the path to save it :",
            validate: val => {
                // 判断末尾是否含斜杠
                if (val.slice(-1) === "/" && val.length > 1) {
                    return '\033[41;37m Error \033[0m You don\'t need to add "/" at the end of the path. [0x0106]';
                }
                else {
                    return true;
                }
            },
            filter: val => {
                if (val.slice(0,1) === "~") {
                    val = home + val.slice(1);
                    return val;
                }
                else {
                    return val;
                }
            }
        },
        // 下载请求限制
        {
            type:'input',
            name: 'request',
            message: "Download requests limit (1-16) :",
            validate: val => {
                // 判断输入数字是否合法
                if (val >=1 && val <= 16) {
                    return true;
                }
                else {
                    return "\033[41;37m Error \033[0m Invalid number. [0x0107]";
                }
            },
            filter: val => {
                // 防止返回parseInt后的数导致无法重新输入，仅在true时返回
                if (val >= 1 && val <= 16) {
                    return parseInt(val);
                }
                else {
                    return val;
                }
            }
        }
    ]).then(answer => {
        mangaUrl = answer.url;
        savePath = answer.path;
        crawlLimit = answer.request;
        checkPath(savePath,"dm5");
    });
}
async function getMangaInfo() {
    dlTime = new Date().getTime();
    console.log("\033[44;37m Info \033[0m Starting browser...\n");
    const browser = await puppeteer.launch();
    console.log("\033[44;37m Info \033[0m Opening page...\n");
    const page = await browser.newPage();
    await page.goto(mangaUrl,{ waitUntil:'networkidle2' });
    console.log("\033[44;37m Info \033[0m Fetching some information...\n");
    // 获取漫画信息，用户信息（请求参数）
    info = await page.evaluate(() => {
        const $ = window.$;
        let imgs;
        let log;
        if ($("div.chapterpager").length > 0) {
            imgs = parseInt($("div.chapterpager:eq(0) a:last").text());
            log = "\033[44;37m Info \033[0m Manga type: B(multi-page manga) | Pictures: "+imgs+"\n";
        }
        else {
            imgs = $("img.load-src").length;
            log = "\033[44;37m Info \033[0m Manga type: A(single-page manga) | Pictures: "+imgs+"\n";
        }
        return {
            picAmount: imgs,
            msg: log,
            cid: window.DM5_CID,
            mid: window.DM5_MID,
            sign: window.DM5_VIEWSIGN,
            signdate: window.DM5_VIEWSIGN_DT,
        }
    });
    console.log(info.msg);
    await browser.close();
    resolveImages();
}
function resolveImages() {
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error("n\\n\033[41;37m Error \033[0m Timed out for 30 secconds.");
            process.exit(1);
        }
    },30000);
    console.log("\033[44;37m Info \033[0m Resolving images...\n");
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new ProgressBar('\033[43;37m Progress \033[0m', info.picAmount);
    resolvePB.render({ completed: 0, total: info.picAmount });
    // 获取图片链接
    // 并发控制
    const getPicUrl = async.queue((obj,callback) => {
        axios.get(`${mangaUrl}/chapterfun.ashx`, {
            params: {
                cid: info.cid,
                page: obj.pic,
                key: '',
                language: 1,
                gtk: 6,
                _cid: info.cid,
                _mid: info.mid,
                _dt: encodeURIComponent(info.signdate),
                _sign: info.sign,
            },
            headers: { 'Referer': mangaUrl },
            timeout: 10000
        }).then(({ data }) => {
            eval(data);
            callback(null,d[0]);
        }).catch(err => callback(err));
    },crawlLimit);
    // 全部成功后触发
    getPicUrl.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log("\n\n\033[44;37m Info \033[0m Checking the server node...\n");
        checkNode(crawlList[0]);
    });
    // 推送任务至队列
    for (let i=0;i<info.picAmount;i++) {
        // 错误时，结束进程
        getPicUrl.push({ pic:i+1 },(err,picUrl) => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"\n");
                console.error("\033[41;37m Error \033[0m Oops! Something went wrong, try again?");
                process.exit(1);
            }
            else {
                crawlList.push(picUrl);
                resolvedImgs++;
                resolvePB.render({ completed: resolvedImgs, total: info.picAmount });
            }
        });
    }
}
function checkNode(defaultNode) {
    // 获取当前下载节点
    defaultNode = defaultNode.split("/")[2].split("-");
    defaultNode.shift();
    defaultNode=defaultNode.join("-");
    // 与节点列表比对
    let isKnownNode = 0;
    for (let i in nodeList) {
        if (defaultNode === nodeList[i]) {
            isKnownNode = 1;
            break;
        }
    }
    if (isKnownNode) {
        console.log("\033[44;37m Info \033[0m The server you are conneted to is included in the list.\n");
    }
    else {
        console.warn('\033[41;37m Warn \033[0m The server you are conneted to is NOT included in the list. (Unknown server)\n');
        nodeList.unshift(defaultNode);
    }
    inquirer.prompt([
        {
            type: 'list',
            name: 'node',
            message: 'Please select a server to download images.',
            choices: nodeList
        }
    ]).then(answer => { downloadImages(answer.node) });
}
function downloadImages(node) {
    let status = 0;
    // 超时，结束进程
    const timer = setTimeout(() => {
        if (!status) {
            console.error("\n\n\033[41;37m Error \033[0m Timed out for 30 secconds.");
            process.exit(1);
        }
    },30000);
    // 替换节点
    for (let i in crawlList) {
        let url = crawlList[i].split("/");
        url[2] = url[2].split("-")[0]+"-"+node;
        crawlList[i] = url.join("/");
    }
    // 下载图片
    // 并发控制
    const download = async.queue((obj,callback) => {
        let picNum = obj.url.split("/")[6].split("_")[0];
        axios.get(obj.url, {
            headers: { 'Referer': mangaUrl },
            responseType: 'arraybuffer',
            timeout: 10000
        }).then(({ data }) => {
            fs.writeFile(`${savePath}/split/${picNum}.jpg`,data,err => {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null,1);
                }
            });
        }).catch(err => callback(err));
    },crawlLimit);
    // 全部完成时触发
    download.drain(() => {
        status = 1;
        clearTimeout(timer);
        console.log("\n\n\033[44;37m Info \033[0m Generating HTML format file...\n");
        generateManga({ imgAmount: info.picAmount, path: savePath, dlTime: dlTime });
    });
    // 下载进度条
    let downloadedImgs = 0;
    const downloadPB = new ProgressBar('\n\033[43;37m Progress \033[0m',info.picAmount);
    downloadPB.render({ completed: 0, total: info.picAmount });
    // 推送任务至队列
    for (let i in crawlList) {
        // 错误时，结束进程
        download.push({ url: crawlList[i] },(err,result) => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"\n");
                console.error("\033[41;37m Error \033[0m Oops! Something went wrong, try again?");
                process.exit(1);
            }
            else {
                downloadedImgs+=result;
                downloadPB.render({ completed: downloadedImgs, total: info.picAmount });
            }
        });
    }
}