const inquirer = require("inquirer");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const minify = require("html-minifier").minify;
const ProgressBar = require("./progressbar");
const fs = require("fs");
const home = require("os").homedir();
let mangaUrl;
let cspeed;
let savePath;
let headless;
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
    },
    {
        type:'input',
        name: 'speed',
        message: "Crawling speed LEVEL(for multi-page manga aka type B). (0.1~0.9):",
        validate: val => {
            if(val >= 0.1 && val <= 0.9) {
                return true;
            }
            else {
                return "\033[41;37m Error \033[0m Invalid number.";
            }
        }
    },
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
    mangaUrl = answer.url;
    cspeed = answer.speed;
    savePath = answer.path;
    headless = answer.nonHeadless != "yes";
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
                next();
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
                next();
            }
        });
    }
    function next() {
        getManga().catch(err => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    }
}
async function getManga() {
    console.log("\033[44;37m Info \033[0m Starting broswer...\n");
    const browser = await puppeteer.launch({headless:headless});
    console.log("\033[44;37m Info \033[0m Opening page...\n");
    const page = await browser.newPage();
    await page.goto(mangaUrl,{waitUntil:"networkidle2"});
    const res = await page.evaluate(() => {
        const $ = window.$;
        $("div.lb-win-con a img").click();
        $("body").attr("style","overflow:hidden;");
        $("div.rightToolBar").attr("style","display:none");
        if (document.querySelector("div.chapterpager") == null) {
            const imgs = $("img.load-src").length;
            return {picAmount:imgs,mangaType:'A',log:"\033[44;37m Info \033[0m Manga type: A(single-page manga)"}
        }
        else {
            const imgs = $("div.chapterpager:eq(0) a:last").text();
            return {picAmount:imgs,mangaType:'B',log:"\033[44;37m Info \033[0m Manga type: B(multi-page manga)"}
        }
    });
    console.log(`${res.log} | Pictures: ${res.picAmount} \n`);
    console.log("\033[44;37m Info \033[0m Downloading manga...");
    const pb = new ProgressBar('\033[43;37m Progress \033[0m',res.picAmount);
    if (res.mangaType == 'A') {
        await DownLoadManga_A();
    }
    else {
        await DownLoadManga_B();
    }
    async function DownLoadManga_A() {
        const splitPics = await page.$$("img.load-src");
        for (let i in splitPics) {
            let j = parseInt(i) + 1;
            await splitPics[parseInt(i)].screenshot({path:`${savePath}/split/${j}.jpg`});
            pb.render({ completed: j,total: res.picAmount });
        }
        console.log("\n\n\033[44;37m Info \033[0m Creating full-manga image...");
        if (headless) {
            console.log("\033[44;37m Info \033[0m Using plan A to create. (Generate HTML file)");
            await genHTML();
        }
        else {
            console.log("\033[44;37m Info \033[0m Using plan B to create. (Generate image)");
            const fullPic = await page.$("div#barChapter");
            await fullPic.screenshot({path:savePath+'/manga.jpg'});
            await end();
        }
    }
    async function DownLoadManga_B() {
        const dl = {
            first: async () => {
                const img = await page.$("img#cp_image");
                await img.screenshot({path:savePath+'/split/1.jpg'});
                pb.render({ completed: 1,total: res.picAmount });
            },
            others: async num => {
                await page.click("img#cp_image");
                await page.waitForFunction(speed => {
                    const $ = window.$;
                    if($("div.item#cp_img p:first").css("opacity") < speed) {
                        return true;
                    }
                },{timeout:30000},cspeed);
                const img = await page.$("img#cp_image");
                await img.screenshot({path:`${savePath}/split/${num}.jpg`});
                pb.render({ completed: num,total: res.picAmount });
            }
        }
        await dl.first();
        for (let i = 0;i < res.picAmount - 1;i++) {
            let j = parseInt(i) + 2;
            await dl.others(j);
        }
        console.log("\n\n\033[44;37m Info \033[0m Creating full-manga image...");
        console.log("\033[44;37m Info \033[0m Using plan B to create. (Generate image)");
        genHTML();
    }
    function genHTML() {
        ejs.renderFile('./template.ejs',{imgs:res.picAmount},(err,data) => {
            if (err) {
                console.error("\033[41;37m Error \033[0m "+err+"\n");
            }
            else {
                fs.writeFile(savePath+'/manga.html',minify(data,{collapseWhitespace:true,minifyCSS:true}),async err1 => {
                    if (err1) {
                        console.error("\033[41;37m Error \033[0m "+err1+"\n");
                    }
                    else {
                        await end();
                    }
                });
            }
        });
    }
    async function end() {
        console.log("\n\033[46;37m Succeed \033[0m Manga has been downloaded.");
        await page.close();
        await browser.close();
    }
}