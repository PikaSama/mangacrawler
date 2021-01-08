"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const html = '<div class="chapterpager"><span class="current">1</span><a href="/m170924-p2/">2</a>   <a href="/m170924-p3/">3</a>   <a href="/m170924-p4/">4</a>   <a href="/m170924-p5/">5</a>   <a href="/m170924-p6/">6</a>   <a href="/m170924-p7/">7</a>   <a href="/m170924-p8/">8</a>   ...<a href="/m170924-p81/">81</a></div><div class="chapterpager"><span class="current">1</span><a href="/m170924-p2/">2</a>   <a href="/m170924-p3/">3</a>   <a href="/m170924-p4/">4</a>   <a href="/m170924-p5/">5</a>   <a href="/m170924-p6/">6</a>   <a href="/m170924-p7/">7</a>   <a href="/m170924-p8/">8</a>   ...<a href="/m170924-p81/">82</a></div>';
const $ = cheerio.load(html);
console.log($('div.chapterpager').html());
