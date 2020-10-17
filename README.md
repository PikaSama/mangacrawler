# Spider-Manga
![author](https://img.shields.io/static/v1?label=AUTHOR&message=Zorin&color=9cf&style=for-the-badge)
![license](https://img.shields.io/github/license/pikasama/spider-manga?style=for-the-badge)
![language](https://img.shields.io/github/languages/top/pikasama/spider-manga?style=for-the-badge)
![release](https://img.shields.io/github/v/release/pikasama/spider-manga?include_prereleases&style=for-the-badge)

一个自己写的nodejs爬虫小练习（2），用于下载漫画

本人代码不精，如有更好的实现方法，欢迎交流（PR/Issues/...）

## 安装
项目依赖于：
 - inquirer
   - 输入菜单
 - puppeteer
   - 用于爬取和下载漫画
 - ejs
   - html模版
 - html-minifier
   - 用于压缩html
   
```bash
npm install
```

本项目仅在Linux平台运行并测试，因个人时间和精力有限，未在Windows平台进行测试，如果你尝试以Windows平台运行，可能会造成问题（如果真有问题还请发至Issues）

注：安装puppeteer需要下载chromium（187MB），请耐心等待（以自带chrome/chromium运行的功能还在开发中）

## 使用
目前仅支持[漫画屋](https://www.dm5.com)网站下的漫画

 - 输入项1
   - 打开网站中的漫画，选择你要下载的一话，复制这一话的链接
   - 运行命令`node manga.js`，粘贴链接
 - 输入项2
   - 输入保存漫画的目录
 - 输入项3
   - 下载速度等级（0.1~0.9），建议范围：0.1～0.7，注：下载速度提升不会很大
   - 含义：在图片加载完后，“加载中”的图片透明度开始降低，0.1～0.9表示当“加载中”图片的透明度降至什么程度时进行下一步操作

## 预览
暂无

## FAQ
暂无

## bug
暂未发现

## 原理
待写

## todo
优先级：由上至下

- [ ] 辨析漫画类型
- [ ] 爬取漫画更多信息
- [ ] 多线程下载
- [ ] 获取漫画更新

## 更新日志
2020.10.17-23:50 v1.0.0 发布初始版本

## 协议
[GPL-v3](http://www.gnu.org/licenses/gpl-3.0.en.html)
