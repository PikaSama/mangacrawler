# Spider-Manga
![Author](https://img.shields.io/static/v1?label=Author&message=Zorin&color=9cf&style=for-the-badge)
![GitHub](https://img.shields.io/github/license/PikaSama/spider-manga?color=success&style=for-the-badge)
![Platform](https://img.shields.io/static/v1?label=Platform&message=Linux&color=orange&style=for-the-badge)

![GitHub top language](https://img.shields.io/github/languages/top/pikasama/spider-manga?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/PikaSama/spider-manga?color=ff69b4&style=for-the-badge)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/PikaSama/spider-manga?color=%23007ec6&include_prereleases&style=for-the-badge)

一个自己写的nodejs爬虫小练习（2），用于下载漫画

本人代码不精，如有更好的实现方法，欢迎交流（PR/Issues/...）

## 安装
项目依赖于：
 - async
   - 并发请求下载（async.queue）
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

### 选项
 - 输入项1：Manga URL
   - 打开网站中的漫画，选择你要下载的一话，复制粘贴这一话的链接
   - 链接格式：http://www.dm5.com/m123456/
 - 输入项2：Save Dir
   - 输入保存漫画的目录，可填家目录符号“～”，程序会自动补全路径
   - 若路径不存在，程序会尝试创建
 - 输入项3：Download requests
   - 并发下载请求数限制，范围在1～16
   - 推荐范围：4～10
 - 选项：Servers
   - 节点列表，选择其中一个进行图片下载
   
### 目录
- split : 单张图片的存放位置
- manga.html ：完整漫画文件

## 预览
暂无

## FAQ
Q1：为啥下载下来的文件是.html格式的？

A1：我并不知道怎么在node中拼接图片（尝试过gm但无果），所以只能以html文档的方式拼接

如果有更好的方法，欢迎提出

Q2：为什么我有时候下载图片会卡在一个地方？

A2：经测试，均未发现是async.mapLimit或async.queue的锅，推测是axios的问题

解决方法：

1. 重新下载，尝试补全图片文件

2. 更换节点，降低请求数并重新下载

本问题暂无最优解，欢迎提出更好的解决方案

## bug
 1. 下载请求数提高后，有几率会卡在某一次请求中（暂无最优解）
 2. 通过html文档拼接的图片有概率会有白条间隔（已设置css样式尽量避免此问题）
 3. 暂未知晓
 
## 原理
待写

## Todo
- [x] 辨析漫画类型
- [x] 漫画类型AB的下载实现
- [x] 并发请求下载
- [x] 并发请求下载·优化
- [ ] 连接超时自动退出
- [ ] 支持生成pdf文件
- [ ] 上传未知节点信息至服务器
- [ ] 对网站 漫画堆 做支持
- [ ] 使用本地chrome/chromium代替
- [ ] 爬取漫画更多信息
- [ ] 获取漫画更新

## 更新日志
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
[GPL-v3](http://www.gnu.org/licenses/gpl-3.0.en.html)
