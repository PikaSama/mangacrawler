"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const html = '<div class="chapterpager"><span class="current">1</span><a href="/m170924-p2/">2</a>   <a href="/m170924-p3/">3</a>   <a href="/m170924-p4/">4</a>   <a href="/m170924-p5/">5</a>   <a href="/m170924-p6/">6</a>   <a href="/m170924-p7/">7</a>   <a href="/m170924-p8/">8</a>   ...<a href="/m170924-p81/">81</a></div><div class="chapterpager"><span class="current">1</span><a href="/m170924-p2/">2</a>   <a href="/m170924-p3/">3</a>   <a href="/m170924-p4/">4</a>   <a href="/m170924-p5/">5</a>   <a href="/m170924-p6/">6</a>   <a href="/m170924-p7/">7</a>   <a href="/m170924-p8/">8</a>   ...<a href="/m170924-p81/">82</a></div>';
const $ = cheerio.load(html);
console.log($('div.chapterpager').html());
