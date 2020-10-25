# Spider-Manga
![author](https://img.shields.io/static/v1?label=AUTHOR&message=Zorin&color=9cf&style=for-the-badge)
![license](https://img.shields.io/github/license/pikasama/spider-manga?style=for-the-badge)
![language](https://img.shields.io/github/languages/top/pikasama/spider-manga?style=for-the-badge)
![release](https://img.shields.io/github/v/release/pikasama/spider-manga?include_prereleases&style=for-the-badge)

一个自己写的nodejs爬虫小练习（2），用于下载漫画

本人代码不精，如有更好的实现方法，欢迎交流（PR/Issues/...）

## 安装
项目依赖于：
 - async
   - 并发请求下载（async.map）
 - axios
   - 爬取漫画信息
 - cheerio
   - 解析漫画信息
 - ejs
   - html模版
 - html-minifier
   - 用于压缩html
 - inquirer
   - 输入菜单
 - puppeteer
   - 用于爬取和下载漫画
 - single-line-log
   - 下载进度条
 - utf8-validate
 - node >= 12
   - 项目基于Nodejs v12.19.0开发
   
使用npm
```bash
npm install
```
使用yarn
```bash
yarn
```
本项目仅在Linux平台运行并测试，因个人时间和精力有限，未在Windows平台进行测试，如果你尝试以Windows平台运行，可能会造成问题（如果真有问题还请发至Issues）

注：安装puppeteer需要下载chromium（187MB），请耐心等待（以自带chrome/chromium运行的功能还在开发中）

## 使用
目前仅支持[漫画屋](https://www.dm5.com)网站下的漫画

漫画类型分为两类：
 - A：单页面多图片的漫画
 - B：多页面单图片的漫画

### 全局输入项
 - 输入项1：Manga URL
   - 打开网站中的漫画，选择你要下载的一话，复制粘贴这一话的链接
   - 链接格式：http://www.dm5.com/m123456/
 - 输入项2：Save Dir
   - 输入保存漫画的目录，可填家目录符号“～”，程序会自动补全路径
   - 若路径不存在，程序会尝试创建
   
### 漫画A输入项
  - 输入项4：GUI or non-GUI
    - 是否显示浏览器界面（puppeteer的headless选项）
    - GUI模式将以图片形式生成完整漫画，non-GUI模式将以html文档形式生成完整漫画
    
### 漫画B输入项
 - 输入项1：DL Speed Level
   - 下载速度等级（0.1~0.9），建议范围：0.1～0.7，注：下载速度提升不会很大
   - 含义：在图片加载完后，“加载中”的图片透明度开始降低，0.1～0.9表示当“加载中”图片的透明度降至什么程度时进行下一步操作
 - 输入项2：DL requests
   - 下载请求数（1-8），注：下载速度有显著提升，但也因请求数多了，网页响应时间也会增长

### 文件
若你是以non-GUI模式下载漫画（A），则完整漫画文件为保存路径中的`manga.html`文件

若你是以GUI模式下载漫画（A），则完整漫画文件为保存路径中的`manga.jpg`

漫画B只能以non-GUI模式下载，保存的文件和上面一致
## 预览
暂无

## FAQ
Q1：为啥下载下来的文件是.html格式的？

A1：我并不知道怎么在node中拼接图片（尝试过gm但无果），所以只能以html文档的方式拼接

如果有更好的方法，欢迎提出

Q2：下载请求数最高才8个，怎么提高它？

A2：下载请求数多了，下载速度会快，但网页响应的速度也会变慢，所以只设置最高8个，后续会进行优化

如果你想提高下载请求数，请在`manga.js`中修改：

在`getMangaInfo()`函数中找到`inquirer.prompt()`函数

在函数里数组的第二个对象中找到`validate`和`filter`方法，修改两个方法中if语句的“8”为其他数字即可

Q3：你这东西好垃圾啊，怎么就支持这一个网站

A3：这个项目本来就是给自己写来用的，放在这里分享一下自己的代码交流一下技术，你要是看不顺眼可以自己找个替代品，例如：[BiliBili漫画](https://manga.bilibili.com)，浏览器拓展[图片助手](http://www.pullywood.com/ImageAssistant/)

## bug
 1. 受网络环境影响，图片可能会有爬取不完整的问题
 2. 通过html文档拼接的图片有概率会有白条间隔（已设置css样式尽量避免此问题）
 3. 暂未知晓
 
## 原理
待写

## todo
优先级：由上至下

- [x] 辨析漫画类型
- [x] 漫画类型AB的下载实现
- [x] 并发请求下载
- [ ] 使用本地chrome/chromium代替
- [ ] 爬取漫画更多信息
- [ ] 获取漫画更新

## 更新日志
2020.10.25-15:35 v1.2.0 
- 优化：重写部分代码，优化漫画解析速度
- 优化：选项菜单逻辑
- 新增：并发请求下载功能

2020.10.18-17:40 v1.1.0 
- 新增：分辨漫画类型，自动选择合适的方式进行下载

2020.10.17-23:50 v1.0.0 
- 发布初始版本

## 协议
[GPL-v3](http://www.gnu.org/licenses/gpl-3.0.en.html)
