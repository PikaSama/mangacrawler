const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const minify = require("html-minifier").minify;
const asyncMap = require("async/map");
const inquirer = require("inquirer");
const ProgressBar = require("./progressbar");
const home = require("os").homedir();
const fs = require("fs");
let mangaUrl;
let savePath;
let headless;
let crawlSpeed;
let crawlList = [];
let picAmount;
let dlTime;
let loadedPage = 0;
inquirer.prompt([
    {
        type:'input',
        name: 'url',
        message: "Please enter the manga's URL:",
        validate: val => {
            val = val.slice(0,8);
            if (val.match(/http:\/\//g) || val.match(/https:\/\//g)) {
                return true;
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
    checkPath();
});
function checkPath() {
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
                getMangaInfo();
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
                getMangaInfo();
            }
        });
    }
}
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
                    name: 'speed',
                    message: "Crawling speed LEVEL(0.1~0.9):",
                    validate: val => {
                        if(val >= 0.1 && val <= 0.9) {
                            return true;
                        }
                        else {
                            return "\033[41;37m Error \033[0m Invalid number.";
                        }
                    },
                    filter: val => {
                        if(val >= 0.1 && val <= 0.9) {
                            return parseFloat(val);
                        }
                        else {
                            return val;
                        }
                    }
                },
                {
                    type:'input',
                    name: 'request',
                    message: "Please type the number of download requests.(1-8):",
                    validate: val => {
                        if (val >=1 && val <= 8) {
                            return true;
                        }
                        else {
                            return "\033[41;37m Error \033[0m Invalid number.";
                        }
                    },
                    filter: val => {
                        if (val >= 1 && val <= 8) {
                            return parseInt(val);
                        }
                        else {
                            return val;
                        }
                    }
                }
            ]).then(async answer => {
                crawlSpeed = answer.speed;
                let arr = [];
                const quot = parseInt(picAmount/answer.request);
                const rmdr = picAmount%answer.request;
                function addFront(index) {
                    let val=0;
                    for (let i=0;i<index;i++) {
                        val+=arr[i];
                    }
                    return val;
                }
                if (picAmount < answer.request) {
                    crawlList[0]=1+"-"+picAmount;
                }
                else {
                    for (let i=0;i<answer.request;i++) {
                        arr.push(quot);
                    }
                    if (rmdr) {
                        for (let i=0;i<rmdr;i++) {
                            arr[i]++;
                        }
                    }
                    for (let i in arr) {
                        let j = parseInt(i);
                        if (j == 0) {
                            crawlList[0]=1+"-"+arr[0];
                        }
                        else {
                            crawlList[j]=addFront(j)+1+"-"+addFront(j+1);
                        }
                    }
                }
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
    dlTime = new Date().getTime();
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
    console.log("\033[44;37m Info \033[0m Starting browser...\n");
    const browser = await puppeteer.launch();
    console.log("\033[44;37m Info \033[0m Downloading manga...");
    let downloaded = 0;
    const pb = new ProgressBar('\033[43;37m Progress \033[0m',picAmount);
    pb.render({ completed: downloaded,total: picAmount });
    const download = async function(item) {
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
        loadedPage++;
        if (loadedPage == crawlList.length) {
            dlTime = new Date().getTime();
        }
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