// 依赖
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const minify = require("html-minifier").minify;
const async = require("async");
const inquirer = require("inquirer");
const home = require("os").homedir();
const fs = require("fs");
// 本地模块
const pathChecker = require("./DirCheck");
const ProgressBar = require("./progressbar");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let picAmount;
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
inquirer.prompt([
    {
        type:'input',
        name: 'url',
        message: "Please enter the manga's URL:",
        validate: val => {
            if (val.slice(0,8).match(/http:\/\//g) || val.slice(0,8).match(/https:\/\//g)) {
                if (val.slice(-1) == "/" && val.length > 1) {
                    return '\033[41;37m Error \033[0m You don\'t need to add "/" at the end of the URL.';
                }
                else {
                    return true;
                }
            }
            else {
                return "\033[41;37m Error \033[0m Invalid URL.";
            }
        }
    },
    {
        type:'input',
        name: 'path',
        message: "Please enter the path to save it:",
        validate: val => {
            if (val.slice(-1) == "/" && val.length > 1) {
                return '\033[41;37m Error \033[0m You don\'t need to add "/" at the end of the path.';
            }
            else {
                return true;
            }
        },
        filter: val => {
            if (val.slice(0,1) == "~") {
                val = home + val.slice(1);
                return val;
            }
            else {
                return val;
            }
        }
    },
    {
        type:'input',
        name: 'request',
        message: "Download requests limit (1-16):",
        validate: val => {
            if (val >=1 && val <= 16) {
                return true;
            }
            else {
                return "\033[41;37m Error \033[0m Invalid number.";
            }
        },
        filter: val => {
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
    pathChecker.check(savePath);
});
exports.getInfo = () => { getMangaInfo() }
function getMangaInfo() {
    console.log("\033[44;37m Info \033[0m Fetching manga info...\n");
    axios.get(mangaUrl).then(resp => {
        const $ = cheerio.load(resp.data);
        if ($("div.chapterpager").length > 0) {
            picAmount = parseInt($("div.chapterpager").eq(0).children("a").last().text());
            console.log("\033[44;37m Info \033[0m Manga type: B(multi-page manga) | Pictures:",picAmount,"\n");
        }
        else {
            picAmount = $("img.load-src").length;
            console.log("\033[44;37m Info \033[0m Manga type: A(single-page manga) | Pictures:",picAmount,"\n");
        }
        resolveImages().catch(err => {
            //  发生错误，结束浏览器进程
            console.error("\n\033[41;37m Error \033[0m "+err+"\n");
            process.exit(1);
        });
    }).catch(err => console.error("\n\033[41;37m Error \033[0m "+err+"\n"));
}
async function resolveImages() {
    console.log("\033[44;37m Info \033[0m Downloading manga...\n");
    dlTime = new Date().getTime();
    console.log("\033[44;37m Info \033[0m Starting browser...\n");
    const browser = await puppeteer.launch();
    console.log("\033[44;37m Info \033[0m Opening page...\n");
    const page = await browser.newPage();
    await page.goto(mangaUrl,{waitUntil:'networkidle2'});
    console.log("\033[44;37m Info \033[0m Resolving images...\n");
    // 获取图片的进度条
    let resolvedImgs = 0;
    const resolvePB = new ProgressBar('\033[43;37m Progress \033[0m',picAmount);
    resolvePB.render({ completed: 0, total: picAmount });
    // 获取请求参数
    const userInfo = await page.evaluate(()=>{ return { cid: window.DM5_CID, mid: window.DM5_MID, sign: window.DM5_VIEWSIGN, signdate: window.DM5_VIEWSIGN_DT } });
    // 获取图片链接
    // 并发控制
    const getPicUrl = async.queue((obj,callback) => {
        axios.get(`${mangaUrl}/chapterfun.ashx?cid=${userInfo.cid}&page=${obj.pic}&key=&language=1&gtk=6&_cid=${userInfo.cid}&_mid=${userInfo.mid}&_dt=${encodeURIComponent(userInfo.signdate)}&_sign=${userInfo.sign}`,{headers:{ 'Referer': mangaUrl }}).then(resp => {
            eval(resp.data);
            callback(null,d[0]);
        }).catch(err => callback(err));
    },crawlLimit);
    // 全部成功后触发
    getPicUrl.drain(() => {
        browser.close();
        console.log("\n\n\033[44;37m Info \033[0m Checking the server node...\n");
        checkNode(crawlList[0]);
    });
    // 推送任务至队列
    for (let i=0;i<picAmount;i++) {
        // 错误时，结束进程
        getPicUrl.push({pic:i+1},(err,picUrl) => {
            if (err) {
                console.error(err);
                console.error("Oops! Something went wrong, try again?");
                process.exit(1);
            }
            else {
                crawlList.push(picUrl);
                resolvedImgs++;
                resolvePB.render({ completed: resolvedImgs, total: picAmount });
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
        if (defaultNode == nodeList[i]) {
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
    ]).then(answer => {
        console.log(answer)
        downloadImages(answer.node);
    });
}
function downloadImages(node) {
    // 替换节点
    for (let i in crawlList) {
        let url = crawlList[i].split("/");
        url[2] = url[2].split("-")[0]+"-"+node;
        crawlList[i] = url.join("/");
        console.log(crawlList[i]);
    }
    // 下载图片
    // 并发控制
    const download = async.queue((obj,callback) => {
        let picNum = obj.url.split("/")[6].split("_")[0];
        axios.get(obj.url,{headers: { 'Referer': mangaUrl }, responseType:'arraybuffer', timeout:6000}).then(resp => resp.data).then(data => {
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
        console.log("\n\n\033[44;37m Info \033[0m Generating HTML format file...\n");
        genHTML();
    });
    // 下载进度条
    let downloadedImgs = 0;
    const downloadPB = new ProgressBar('\033[43;37m Progress \033[0m',picAmount);
    downloadPB.render({ completed: 0, total: picAmount });
    // 推送任务至队列
    for (let i in crawlList) {
        // 错误时，结束进程
        download.push({url: crawlList[i]},(err,result) => {
            if (err) {
                console.error(err);
                console.error("Oops! Something went wrong, try again?")
                process.exit(1);
            }
            else {
                downloadedImgs+=result;
                downloadPB.render({ completed: downloadedImgs, total: picAmount });
            }
        });
    }
}
function genHTML() {
    ejs.renderFile('./template.ejs',{ imgs: picAmount },(err,data) => {
        if (err) {
            console.error("\033[41;37m Error \033[0m "+err+"\n");
        }
        else {
            fs.writeFile(savePath+'/manga.html',minify(data,{ collapseWhitespace:true, minifyCSS:true }),err1 => {
                if (err1) {
                    console.error("\033[41;37m Error \033[0m "+err1+"\n");
                }
                else {
                    dlTime = Math.round((new Date().getTime()-dlTime)/100)/10+"s";
                    console.log("\033[46;37m Succeed \033[0m Manga has been downloaded in",dlTime);
                }
            });
        }
    });
}