// 依赖
const axios = require("axios");
const async = require("async");
const cheerio = require("cheerio");
const inquirer = require("inquirer");
// Node API
const home = require("os").homedir();
const fs = require("fs");
// 本地模块
const cli = require("../modules/cli")
const checkPath = require("../modules/dirCheck");
const generateManga = require("../modules/generator");
const ProgressBar = require("../modules/progressbar");
cli("mhxin",result => {
    console.log(result)
});