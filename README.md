# Instagram 下载器修正版

基于 [y252328/Instagram_Download_Button](https://github.com/y252328/Instagram_Download_Button) 的个人修正版，保留原作者署名与 MIT 许可证。

## 安装

1. 在 Edge 或 Chrome 中安装篡改猴（Tampermonkey），开启“允许用户脚本”，允许访问 Instagram。
2. [点击安装脚本](https://raw.githubusercontent.com/colonnellotong/instagram-download-button/main/Instagram-Download-Button-fixed.user.js)。如果浏览器显示源码，在篡改猴中新建脚本并粘贴全部内容。
3. 停用旧版本，刷新 Instagram。

## 修改内容

- 下载与新标签页按钮使用独立横向工具栏，优先定位帖子操作栏。
- 首页从按钮所属帖子提取当前可见媒体，避免使用其他帖子的内容。
- 视频接口使用对应帖子的 ID；失败时显示错误信息。

## 使用与限制

点击帖子下方的下载按钮保存当前可见媒体，或点击打开按钮查看媒体链接。轮播需先切换到要保存的一张。

当前版本为 `1.17.18.2`，已通过 JavaScript 语法检查，尚未完成首页、视频、轮播、快拍和头像的全面实测。图片优先使用页面当前加载的资源，不保证最高分辨率。部分轮播视频无法确定序号时，会提示打开帖子后下载。Instagram 页面或接口调整可能导致功能失效。

此脚本不包含账号凭据，也不通过第三方下载服务处理媒体。请仅保存你有权保存的内容。
