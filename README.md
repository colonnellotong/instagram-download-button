# Instagram 下载器

基于 [y252328/Instagram_Download_Button](https://github.com/y252328/Instagram_Download_Button) 的个人修正版，保留原作者署名与 MIT 许可证。同一项目提供两种安装方式，请只启用其中一种，以免按钮重复。

## 选择版本

| 版本 | 适用平台 | 当前版本 | 安装入口 |
| --- | --- | --- | --- |
| 浏览器扩展 | Edge / Chrome，无需篡改猴 | 0.1.0 | [下载扩展 ZIP](https://github.com/colonnellotong/instagram-download-button/raw/refs/heads/main/Instagram-Downloader-Extension-0.1.0.zip) |
| 用户脚本 | 已安装篡改猴的浏览器 | 1.17.18.2 | [安装用户脚本](https://raw.githubusercontent.com/colonnellotong/instagram-download-button/main/Instagram-Download-Button-fixed.user.js) |

## 安装浏览器扩展

1. 下载并解压上面的扩展 ZIP，保留整个 `extension` 文件夹。
2. Edge 打开 `edge://extensions/`；Chrome 打开 `chrome://extensions/`。
3. 开启“开发者模式”，点击“加载解压缩的扩展程序”。
4. 选择含 `manifest.json` 的 `extension` 文件夹。
5. 停用篡改猴里的旧 Instagram 下载器，刷新 Instagram。

下载交给浏览器处理，保存到浏览器下载目录下的 `Instagram` 文件夹。仅申请 `downloads` 权限，内容脚本只在 `https://www.instagram.com/*` 运行。

这是本地开发者安装版，尚未上架商店，不会自动更新。更新时替换扩展文件，在扩展管理页重新加载，再刷新 Instagram。详情见 [扩展说明](extension/README.txt)。

## 安装篡改猴脚本

1. 在 Edge 或 Chrome 中安装篡改猴（Tampermonkey），开启“允许用户脚本”，允许访问 Instagram。
2. [点击安装脚本](https://raw.githubusercontent.com/colonnellotong/instagram-download-button/main/Instagram-Download-Button-fixed.user.js)。如果浏览器显示源码，在篡改猴中新建脚本并粘贴全部内容。
3. 停用旧版本及扩展版，刷新 Instagram。

用户脚本继续保留原来的安装地址和 GitHub 更新配置。

## 功能与限制

- 下载和打开按钮使用独立横向工具栏，优先放在帖子操作栏。
- 首页从按钮所属帖子识别当前可见媒体；轮播需先切换到目标图片。
- 部分轮播视频无法确定序号时，会提示打开帖子后下载。
- 图片使用页面当前加载资源，不保证最高分辨率；Instagram 页面或接口变化仍可能导致失效。
- 用户脚本已通过语法检查；扩展已通过语法检查和 6 项后台自动测试，尚未在实际浏览器中加载验证，也未完成首页、视频、轮播、快拍和头像的全面实测。

项目不包含账号凭据，不通过第三方下载服务处理媒体。请仅下载你有权保存的内容。

## 源码与验证

- `Instagram-Download-Button-fixed.user.js`：篡改猴版。
- `extension/`：Manifest V3 扩展源码，可直接加载。
- `tests/extension.test.cjs`：扩展后台消息、域名限制、文件命名等测试。

```sh
node --check extension/content.js
node --check extension/background.js
node --test tests/extension.test.cjs
```
