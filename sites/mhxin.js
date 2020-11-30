/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 漫画站点“漫画芯”的漫画下载模块
 * License: GPL-3.0
 */
// 依赖
const axios = require("axios");
const async = require("async");
const cheerio = require("cheerio");
// Node API
const home = require("os").homedir();
const fs = require("fs");
// 本地模块
const cli = require("../modules/cli")
const checkPath = require("../modules/dirCheck");
const generateManga = require("../modules/generator");
const ProgressBar = require("../modules/progressbar");
let mangaUrl;
let savePath;
let crawlLimit;
let crawlList = [];
let mangaImages = 0;
function prepare() {
    cli("mhxin",result => {
        ({ mangaUrl, savePath, crawlLimit } = result);
        checkPath(savePath,() => {
            getMangaInfo();
        });
    });
}
function getMangaInfo() {
    function getUrl({ url, extra },callback) {
        axios.get(url)
            .then(({ data }) => {
                const $ = cheerio.load(data);
                let statement = $("div#images").next().html().split("}");
                extra = extra || '';
                statement[7]=extra + "let pushFunc = p.split(';').slice(0,5);let url = pushFunc[4].split('\"')[1];pushFunc[3] = pushFunc[3].split('}').slice(0,3).join('}') + '}crawlList.push(getImageUrl(\\'' + url + '\\'))';return pushFunc.slice(0,4).join(';')";
                eval(statement.join("}"));
                console.log(crawlList);
            })
            .catch(err => console.error(err));
    }
    getUrl({
        url: mangaUrl,
        extra: 'let images = p.split(\'<p>\')[1].split(\'</p>\')[0].split(\'/\')[1];',
    },(err,log) => {
        console.log("hi");
    });
}
prepare()