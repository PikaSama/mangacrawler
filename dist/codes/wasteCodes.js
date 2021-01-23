var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Author: Zorin
 * Github: https://github.com/PikaSama
 * Project: Spider-Manga
 * Description: 废弃但仍有参考价值的代码
 * License: GPL-3.0
 */
// Description: 使用sharp进行图片拼接，因运行时间过慢，拼接后的效果无法达到预期废弃
const fs = require("fs");
const sharp = require("sharp");
// 模拟参数
let picAmt = 20;
let path = "./yl/split/";
// 变量
let imgDataList = [];
let imgInfoList = [];
let imgOffsetTopList = [];
let fullHeight = 0;
let maxWidth = 0;
(() => __awaiter(this, void 0, void 0, function* () {
    for (let i = 0; i < picAmt; i++) {
        const img = yield sharp(`${path}${i + 1}.jpg`);
        const data = yield img.png().toBuffer().catch(err => console.error(err));
        const info = yield img.metadata().catch(err => console.error(err));
        imgDataList.push(data);
        imgInfoList.push({ w: info.width, h: info.height });
        fullHeight += info.height;
        maxWidth = Math.max(maxWidth, info.width);
    }
    const background = yield sharp({
        create: {
            width: maxWidth,
            height: fullHeight,
            channels: 4,
            background: { r: 33, g: 33, b: 33, alpha: 1 }
        }
    }).png().toBuffer();
    imgInfoList.reduce((prev, el) => {
        imgOffsetTopList.push(prev);
        return prev + el.h;
    }, 0);
    const result = yield imgOffsetTopList.reduce((prev, el, index) => __awaiter(this, void 0, void 0, function* () {
        let left = Math.round((maxWidth - imgInfoList[index].w) / 2);
        return Promise.resolve(prev).then(data => sharp(data).composite([{ input: imgDataList[index], top: el, left: left }]).png().toBuffer());
    }), background);
    fs.writeFileSync("/home/zorin/Desktop/test.png", result);
}))();
// Description: 使用canvas,images拼接图片，因无法大尺寸图片废弃
const canvas = require("canvas");
const images = require("images");
let imgInfoList = [];
let heightOffsetList = [];
let fullHeight;
let maxWidth = 0;
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 81; i++) {
            imgInfoList.push(images(`./yl/split/${i + 1}.jpg`).size());
        }
        fullHeight = imgInfoList.reduce((prev, el) => {
            heightOffsetList.push(prev);
            maxWidth = Math.max(maxWidth, el.width);
            return prev + el.height;
        }, 0);
        console.log(maxWidth, fullHeight);
        // 高度限制：32767，无法达到更高
        const fullImg = canvas.createCanvas(maxWidth, fullHeight);
        const imgCtx = fullImg.getContext("2d");
        for (let i = 0; i < 81; i++) {
            const img = yield canvas.loadImage(`./yl/split/${i + 1}.jpg`);
            const widthOffset = Math.round((maxWidth - imgInfoList[i].width) / 2);
            imgCtx.drawImage(img, widthOffset, heightOffsetList[i]);
        }
        const imgData = fullImg.toBuffer();
        fs.writeFileSync("test.png", imgData);
    });
})();
