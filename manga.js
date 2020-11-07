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
let headless;
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
    }
]).then(answer => {
    mangaUrl = answer.url;
    savePath = answer.path;
    pathChecker.check(savePath);
    getMangaInfo();
});
function getMangaInfo() {
    console.log("\033[44;37m Info \033[0m Fetching manga info...\n");
    axios.get(mangaUrl).then(resp => {
        const $ = cheerio.load(resp.data);
        if ($("div.chapterpager").length > 0) {
            picAmount = parseInt($("div.chapterpager").eq(0).children("a").last().text());
            console.log("\033[44;37m Info \033[0m Manga type: B(multi-page manga) | Pictures:",picAmount,"\n");
            inquirer.prompt([
                {
                    type:'input',
                    name: 'request',
                    message: "Download request limits(1-16):",
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
            ]).then(async answer => {
                crawlLimit = answer.request;
                downloadMangaB().catch(err => {
                    console.error("\n\033[41;37m Error \033[0m "+err+"\n");
                    process.exit(1);
                });
            });
        }
        else {
            picAmount = $("img.load-src").length;
            console.log("\033[44;37m Info \033[0m Manga type: A(single-page manga) | Pictures:",picAmount,"\n");
            inquirer.prompt([
                {
                    type:'list',
                    name: 'nonHeadless',
                    message: "Display browser?(GUI or no-GUI)",
                    choices: [
                        "Yes",
                        "No"
                    ],
                    default: "No",
                    filter: val => val.toLowerCase()
                }
            ]).then(answer => {
                headless = answer.nonHeadless != "yes"
                if(headless) {
                    console.log("\033[44;37m Info \033[0m Full manga image will be generate in HTML format.");
                }
                else {
                    console.log("\033[44;37m Info \033[0m Full manga image will be generate in JPEG format.");
                }
                downloadMangaA().catch(err => {
                    console.error("\n\033[41;37m Error \033[0m "+err+"\n");
                    process.exit(1);
                });
            });
        }
    }).catch(err => console.error("\n\033[41;37m Error \033[0m "+err+"\n"));
}
async function downloadMangaA() {
    dlTime = new Date().getTime();
    console.log("\033[44;37m Info \033[0m Starting browser...\n");
    const browser = await puppeteer.launch({headless:headless});
    console.log("\033[44;37m Info \033[0m Opening page...\n");
    const page = await browser.newPage();
    await page.goto(mangaUrl,{waitUntil:"networkidle2"});
    await page.evaluate(()=>{
        const $ = window.$;
        $("div.lb-win-con a img").click();
        $("body").attr("style","overflow:hidden;");
        $("div.rightToolBar").attr("style","display:none");
    });
    console.log("\033[44;37m Info \033[0m Downloading manga...");
    const pb = new ProgressBar('\033[43;37m Progress \033[0m',picAmount);
    pb.render({ completed: 0,total: picAmount });
    const splitPics = await page.$$("img.load-src");
    for (let i in splitPics) {
        let j = parseInt(i) + 1;
        await splitPics[parseInt(i)].screenshot({path:`${savePath}/split/${j}.jpg`});
        pb.render({ completed: j,total: picAmount });
    }
    console.log("\n\n\033[44;37m Info \033[0m Generating full manga image...");
    if (headless) {
        await browser.close();
        genHTML();
    }
    else {
        const fullPic = await page.$("div#barChapter");
        await fullPic.screenshot({path:savePath+'/manga.jpg'});
        await browser.close();
        dlTime = Math.round((new Date().getTime()-dlTime)/100)/10+"s";
        console.log("\n\033[46;37m Succeed \033[0m Manga has been downloaded in",dlTime);
    }
}
async function downloadMangaB() {
    dlTime = new Date().getTime();
    console.log("\033[44;37m Info \033[0m Starting browser...\n");
    const browser = await puppeteer.launch();
    console.log("\033[44;37m Info \033[0m Opening page...\n");
    const page = await browser.newPage();
    await page.goto(mangaUrl,{waitUntil:'networkidle2'});
    console.log("\033[44;37m Info \033[0m Resolving images...\n");
    // 获取请求参数
    const userInfo = await page.evaluate(()=>{ return {cid: window.DM5_CID, mid: window.DM5_MID, sign: window.DM5_VIEWSIGN, signdate: window.DM5_VIEWSIGN_DT } });
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
        console.log(crawlList.length);
        checkNode(crawlList[0]);
    });
    // 推送任务至队列
    for (let i=0;i<picAmount;i++) {
        // 错误时，结束进程
        getPicUrl.push({pic:i+1},(err,picUrl) => {
            if (err) {
                console.error(err);
                console.error("Oops! Something went wrong, try again?")
                process.exit(1);
            }
            else {
                crawlList.push(picUrl);
            }
        });
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
            console.log("Known node");
        }
        else {
            console.log("Unknown node");
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
                        callback(null,picNum);
                    }
                });
            }).catch(err => callback(err));
        },crawlLimit);
        // 全部完成时触发
        download.drain(() => {
            console.log("Done");
        });
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
                    console.log("Done:",result);
                }
            });
        }
    }
    /*
    console.log(crawlList);
    const download = (item,callback) => {
        let picNum = item.split("/")[6].split("_")[0];
        axios.get(item,{headers:{'Referer':mangaUrl},responseType:'arraybuffer',timeout:10000}).then(resp => resp.data).then(data => {
            fs.writeFile(`${savePath}/${picNum}.jpg`,data,err => {
                if (err) {
                    console.error(err);
                }
                else {
                    console.log(picNum,"done");
                    callback(null);
                }
            });
        }).catch(() => {
            console.log(picNum,"Download failed. Trying another server...");
            downloadByNode(1);
        });
        function downloadByNode(node) {
            let url = item;
            url=url.split("/");
            url[2]=url[2].split("-")[0]+"-"+nodeList[node-1];
            url=url.join("/");
            axios.get(url,{headers:{'Referer':mangaUrl},responseType:'arraybuffer',timeout:10000}).then(resp => resp.data).then(data => {
                fs.writeFile(`${savePath}/${picNum}.jpg`,data,err => {
                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log(picNum,"done");
                        callback(null);
                    }
                });
            }).catch(() => {
                if (node == nodeList.length) {
                    console.log("Failed: max tries...");
                    callback(null);
                }
                else {
                    console.log(picNum,"Download failed. Trying another server...");
                    downloadByNode(node+1);
                }
            });
        }
    }
    asyncMapLimit(crawlList,crawlLimit,download,err => {
        if (err) {
            console.error("\n\033[41;37m Error \033[0m "+err+"\n");
            process.exit(1);
        }
        else {
            browser.close();
            console.log("\n\n\033[44;37m Info \033[0m DONE");
        }
    });

    /*
    console.log("\033[44;37m Info \033[0m Downloading manga...");
    let downloaded = 0;
    const pb = new ProgressBar('\033[43;37m Progress \033[0m',picAmount);
    pb.render({ completed: downloaded,total: picAmount });
    const download = async (item) => {
        let url;
        item=item.split("-");
        item[0]=parseInt(item[0]);
        item[1]=parseInt(item[1]);
        const page = await browser.newPage();
        if(mangaUrl.slice(-1) == "/") {
            url=mangaUrl.slice(0,-1)+"-p"+item[0];
        }
        else {
            url=mangaUrl+"-p"+item[0];
        }
        await page.goto(url,{waitUntil:'networkidle2'});
        await page.evaluate(()=>{
            const $ = window.$;
            $("div.lb-win-con a img").click();
            $("body").attr("style","overflow:hidden;");
            $("div.rightToolBar").attr("style","display:none");
        });
        let isFirst=1;
        for (let i=item[0];i<=item[1];i++) {
            if(isFirst) {
                const img = await page.$("img#cp_image");
                await img.screenshot({path:`${savePath}/split/${i}.jpg`});
                isFirst=0;
            }
            else {
                await page.click("img#cp_image");
                await page.waitForFunction(speed => {
                    const $ = window.$;
                    if($("div.item#cp_img p:first").css("opacity") < speed) {
                        return true;
                    }
                },{timeout:30000},crawlSpeed);
                const img = await page.$("img#cp_image");
                await img.screenshot({path:`${savePath}/split/${i}.jpg`});
            }
            downloaded++;
            pb.render({ completed: downloaded,total: picAmount });
        }
    }
    const neodown = async (item) => {
        const page = await browser.newPage();
        await page.goto("http://www.dm5.com/m170924-p"+item,{waitUntil:'load'});
        await page.waitForSelector("img#cp_image");
        await page.close();
        console.log(item,"loaded");
    }
    console.time();
    asyncMapLimit(crawlList,4,neodown,err => {
        if (err) {
            console.error("\n\033[41;37m Error \033[0m "+err+"\n");
            process.exit(1);
        }
        else {
            browser.close();
            console.timeEnd();
            console.log("\n\n\033[44;37m Info \033[0m DONE");
        }
    })
    /*
    asyncMap(crawlList,download,err => {
        if (err) {
            console.error("\n\033[41;37m Error \033[0m "+err+"\n");
            process.exit(1);
        }
        else {
            browser.close();
            console.log("\n\n\033[44;37m Info \033[0m Generating full manga image...");
            genHTML();
        }
    });

     */
}
function genHTML() {
    ejs.renderFile('./template.ejs',{imgs:picAmount},(err,data) => {
        if (err) {
            console.error("\033[41;37m Error \033[0m "+err+"\n");
        }
        else {
            fs.writeFile(savePath+'/manga.html',minify(data,{collapseWhitespace:true,minifyCSS:true}),async err1 => {
                if (err1) {
                    console.error("\033[41;37m Error \033[0m "+err1+"\n");
                }
                else {
                    dlTime = Math.round((new Date().getTime()-dlTime)/100)/10+"s";
                    console.log("\n\033[46;37m Succeed \033[0m Manga has been downloaded in",dlTime);
                }
            });
        }
    });
}