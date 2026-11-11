Instagram 下载器扩展 0.1.0

安装（Edge / Chrome）
1. 解压 ZIP，保留整个 extension 文件夹，不要只取出某一个文件。
2. Edge 打开 edge://extensions/；Chrome 打开 chrome://extensions/。
3. 打开“开发者模式”，点击“加载解压缩的扩展程序”。
4. 选择含 manifest.json 的 extension 文件夹。
5. 停用篡改猴里的旧 Instagram 下载脚本，刷新已经打开的 Instagram 页面。

使用
帖子操作栏会出现“打开”和“下载”图标；轮播先切换到目标图片。
下载交给浏览器处理，文件位于浏览器下载目录的 Instagram 子目录。
下载开始后若被服务器拒绝或中断，请在浏览器下载列表查看原因。
文件夹安装后请不要移动或删除；修改扩展文件后，需在扩展管理页重新加载，再刷新 Instagram。

权限与隐私
只申请 downloads 权限；内容脚本只在 https://www.instagram.com/* 运行。
后台只接受来自 Instagram 内容脚本的消息，并限制媒体地址为 Instagram / CDN 域名。
使用浏览器现有登录会话，不读取或导出 Cookie，不上传媒体到第三方服务。
无遥测、无外部脚本、无自动批量下载。

测试与限制
这是本地开发者安装版，尚未发布到扩展商店，不会从 GitHub 自动更新。
已通过语法检查及后台下载消息、域名限制、文件命名等 6 项自动测试。
尚未在实际浏览器中加载验证，Instagram 页面下载也未完成实测。
沿用修正版媒体识别逻辑，不保证最高分辨率；部分轮播视频需打开帖子后下载。
快拍和头像支持沿用原版，未经本次实测；Instagram 改版后仍可能需要维护。
请仅下载你有权保存的内容。

来源
原项目 https://github.com/y252328/Instagram_Download_Button
作者 ZhiYu / y252328，MIT 许可证见 LICENSE。
扩展版基于本仓库 userscript 1.17.18.2 改造。
实现参考：https://developer.chrome.com/docs/extensions/reference/api/downloads
内容脚本参考：https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
