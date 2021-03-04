# MangaCrawler

[![Join the chat at https://gitter.im/PikaSama/MangaCrawler](https://badges.gitter.im/PikaSama/MangaCrawler.svg)](https://gitter.im/PikaSama/MangaCrawler?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![Author](https://img.shields.io/static/v1?label=Author&message=Zorin&color=royalblue&style=for-the-badge)
![Platform](https://img.shields.io/static/v1?label=Platform&message=Linux&color=cornflowerblue&style=for-the-badge)
![GitHub](https://img.shields.io/github/license/PikaSama/spider-manga?color=limegreen&style=for-the-badge)
![Node version](https://img.shields.io/static/v1?label=node&message=>=12&color=success&style=for-the-badge)

![GitHub repo size](https://img.shields.io/github/repo-size/PikaSama/spider-manga?color=ff69b4&style=for-the-badge)
![GitHub top language](https://img.shields.io/github/languages/top/pikasama/spider-manga?style=for-the-badge&color=00648C)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/PikaSama/spider-manga?color=%23007ec6&include_prereleases&style=for-the-badge)

## 介绍
一个自己写的nodejs爬虫小练习（2），用于下载漫画

本人代码不精，如有更好的实现方法，欢迎交流（PR/Issues/...）

## 快速开始
### 安装
使用yarn(推荐)
```bash
yarn --prod
```   
使用npm
```bash
npm install --production
```

本项目仅在Linux平台测试并运行，因个人时间和精力有限，未在Windows平台进行测试，无法确定是否会造成问题

如果你在Windows平台运行此项目出现问题，请提交到Issues

### 运行
目前支持以下网站的漫画

- [漫画屋](http://www.dm5.com)
- [漫画芯](https://m.mhxin.com)

使用下面的命令运行

使用yarn(推荐)
```bash
yarn app
```   
使用npm
```bash
npm run app
```

### 目录结构
存放漫画的文件夹中含有目录和文件各一个
- 目录：split -- 单张图片的存放位置
- 文件：manga.html -- 完整漫画文件

## bug
 1. 下载请求数提高后，有几率会卡在某一次请求中（若网站支持切换下载节点可通过切换下载节点解决）
 2. 暂未知晓

## Todo
- [x] 辨析漫画类型
- [x] 漫画类型AB的下载实现
- [x] 并发请求下载
- [x] 并发请求下载·优化
- [x] 连接超时自动退出 
- [x] 对网站 漫画芯 做支持
- [x] 爬取漫画更多信息
- [ ] 上传未知节点信息至服务器
- [ ] 对网站 漫画堆 做支持
- [ ] 获取漫画更新

## 更新日志
2021.1.25 21:06 v1.4.0-rc.3
- 修改：项目使用ESLint + Prettier规范代码，使用dpdm检查模块的循环依赖性
- 修复：漫画芯的图片链接解析
- 优化：提升漫画堆获取漫画信息的速度
- 修改：将puppeteer移入devDependencies

2020.12.19 17:58 v1.4.0-rc.2
- 优化：代码逻辑

2020.12.5 23:24 v1.4.0-rc.1
- 修改：项目使用typescript重写（本人仍是typescript小白，请多多指教）
- 优化：代码模块化xN，优化目录结构
- 新增：对网站 漫画芯 的支持
- 修改：原先废弃代码的依赖在项目的devDependencies中，现已移除，改为开发时用到的typescript文件声明依赖

2020.11.29 18:57 v1.4.0-alpha.2
- 优化：代码模块化
- 修改：在v1.4.0-alpha.2-1(非release版)对nodejs循环依赖问题的解决方式，现采用回调函数解决
- 增加：错误代码，方便开发者维护
- 

2020.11.22 22:14 v1.4.0-alpha.1
- 修改：模块的导出方式
- 修改：代码进一步模块化
- 增加：一些测试代码

2020.11.12 22:01 v1.3.0
- 优化：获取漫画信息的方式
- 优化：日志输出

2020.11.8 2:08 v1.3.0-rc.1
- 优化：重构部分代码，解析图片，下载图片速度提升
- 修改：使用async.queue限制下载请求
- 修改：选项菜单优化，取消对GUI界面的支持
- 修改：解析图片，下载图片时一旦发生错误，立即终止进程

2020.11.7 21:23 v1.3.0-alpha.2
- 增加：判断当前节点是否在节点列表中，选择节点下载功能
- 修改：取消自动切换节点功能

2020.11.1-19:24 v1.3.0-alpha.1
- 增加：服务器节点列表
- 修改：使用async.mapLimit限制下载请求

2020.10.25-15:35 v1.2.0 
- 优化：重写部分代码，优化漫画解析速度
- 优化：选项菜单逻辑
- 新增：并发请求下载功能

2020.10.18-17:40 v1.1.0 
- 新增：分辨漫画类型，自动选择合适的方式进行下载

2020.10.17-23:50 v1.0.0 
- 发布初始版本

## 协议
[MIT](https://mit-license.org/)
