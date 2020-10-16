const inquirer = require("inquirer");
const puppeteer = require("puppeteer");
const ProgressBar = require("./progressbar");
let mangaUrl;
let cspeed;
let savePath;
let downloaded = 0;
inquirer.prompt([
    {
        type:'input',
        name: 'url',
        message: "Please enter the manga's URL:",
        validate: val => {
            val=val.slice(0,8);
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
        message: "Please enter the path to save it:"
    },
    {
        type:'input',
        name: 'speed',
        message: "Crawling speed LEVEL(NOT A UNIT). (0.1~0.9):",
        validate: val => {
            if(val >= 0.1 && val <= 0.9) {
                return true;
            }
            else {
                return "\033[41;37m Error \033[0m Invalid number.";
            }
        }
    }
]).then(answer => {
    mangaUrl = answer.url;
    cspeed = answer.speed;
    savePath = answer.path;
    getManga().catch(err => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
});
async function getManga() {
    console.log("\033[44;37m Info \033[0m Starting broswer...");
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto(mangaUrl);
    const imgAmount = await page.evaluate(() => {
        const $ = window.$;
        $("div.lb-win-con a img").click();
        const imgs = $("div.chapterpager:eq(0) a:last").text();
        $("body").attr("style","overflow:hidden;");
        $("div.rightToolBar").attr("style","display:none");
        return imgs;
    });
    const downloadManga = {
        first: async () => {
            const img = await page.$("img#cp_image");
            await img.screenshot({path:savePath+'/1.jpg'});
            downloaded++;
            pb.render({ completed: downloaded,total: imgAmount });
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
            await img.screenshot({path:savePath+'/'+num+'.jpg'});
            downloaded++;
            pb.render({ completed: downloaded,total: imgAmount });
        }
    }
    console.log("\033[44;37m Info \033[0m Downloading manga...");
    const pb = new ProgressBar('Progress',imgAmount);
    await downloadManga.first();
    for (let i = 0;i < imgAmount - 1;i++) {
        await downloadManga.others(i+2);
    }
    console.log("\n\033[46;37m Succeed \033[0m Manga has been downloaded.");
    await page.close();
    await browser.close();
}