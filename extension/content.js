// Adapted from y252328/Instagram_Download_Button (MIT). See LICENSE.
(function () {
    'use strict';

    // =================
    // =    Options    =
    // =================
    // Old method is faster than new method, but not work or unable get highest resolution media sometime
    const disableNewUrlFetchMethod = false;
    const prefetchAndAttachLink = false; // prefetch and add link into the button elements
    const hoverToFetchAndAttachLink = true;  // fetch and add link when hover the button
    const replaceJpegWithJpg = false;
    // === File name placeholders ===
    // %id% : the poster id
    // %datetime% : the media upload time
    // %medianame% : the original media file name
    // %postId% : the post id
    // %mediaIndex% : the media index in multiple-media posts
    const postFilenameTemplate = '%id%-%datetime%-%medianame%';
    const storyFilenameTemplate = postFilenameTemplate;
    // === Datetime placeholders ===
    // %y%: year (4 digits)
    // %m%: month (01-12)
    // %d%: day (01-31)
    // %H%: hour (00-23)
    // %M%: min (00-59)
    // %S%: sec (00-59)
    const datetimeTemplate = '%y%%m%%d%_%H%%M%%S%';
    // ==================

    const postIdPattern = /\/(?:p|reel|reels)\/([^/?#]+)(?:\/|$)/;
    const postUrlPattern = /instagram\.com\/(?:[^/]+\/)?(?:p|reel|reels)\/[\w-]+/;

    var svgDownloadBtn = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" height="24" width="24"
     viewBox="0 0 477.867 477.867" style="fill:%color;" xml:space="preserve">
    <g>
        <path d="M443.733,307.2c-9.426,0-17.067,7.641-17.067,17.067v102.4c0,9.426-7.641,17.067-17.067,17.067H68.267
            c-9.426,0-17.067-7.641-17.067-17.067v-102.4c0-9.426-7.641-17.067-17.067-17.067s-17.067,7.641-17.067,17.067v102.4
            c0,28.277,22.923,51.2,51.2,51.2H409.6c28.277,0,51.2-22.923,51.2-51.2v-102.4C460.8,314.841,453.159,307.2,443.733,307.2z"/>
    </g>
    <g>
        <path d="M335.947,295.134c-6.614-6.387-17.099-6.387-23.712,0L256,351.334V17.067C256,7.641,248.359,0,238.933,0
            s-17.067,7.641-17.067,17.067v334.268l-56.201-56.201c-6.78-6.548-17.584-6.36-24.132,0.419c-6.388,6.614-6.388,17.099,0,23.713
            l85.333,85.333c6.657,6.673,17.463,6.687,24.136,0.031c0.01-0.01,0.02-0.02,0.031-0.031l85.333-85.333
            C342.915,312.486,342.727,301.682,335.947,295.134z"/>
    </g>
</svg>`;

    var svgNewtabBtn = `<svg id="Capa_1" style="fill:%color;" viewBox="0 0 482.239 482.239" xmlns="http://www.w3.org/2000/svg" height="24" width="24">
    <path d="m465.016 0h-344.456c-9.52 0-17.223 7.703-17.223 17.223v86.114h-86.114c-9.52 0-17.223 7.703-17.223 17.223v344.456c0 9.52 7.703 17.223 17.223 17.223h344.456c9.52 0 17.223-7.703 17.223-17.223v-86.114h86.114c9.52 0 17.223-7.703 17.223-17.223v-344.456c0-9.52-7.703-17.223-17.223-17.223zm-120.56 447.793h-310.01v-310.01h310.011v310.01zm103.337-103.337h-68.891v-223.896c0-9.52-7.703-17.223-17.223-17.223h-223.896v-68.891h310.011v310.01z"/>
</svg>`;

    var preUrl = "";

    document.addEventListener('keydown', keyDownHandler);

    function keyDownHandler(event) {
        if (window.location.href === 'https://www.instagram.com/') return;

        const mockEventTemplate = {
            stopPropagation: function () { },
            preventDefault: function () { }
        };

        if (event.altKey && (event.code === 'KeyK' || event.key == 'k')) {
            let buttons = document.getElementsByClassName('download-btn');
            if (buttons.length > 0) {
                let mockEvent = { ...mockEventTemplate };
                mockEvent.currentTarget = buttons[buttons.length - 1];
                if (prefetchAndAttachLink || hoverToFetchAndAttachLink) onMouseInHandler(mockEvent);
                onClickHandler(mockEvent);
            }
        }
        if (event.altKey && (event.code === 'KeyI' || event.key == 'i')) {
            let buttons = document.getElementsByClassName('newtab-btn');
            if (buttons.length > 0) {
                let mockEvent = { ...mockEventTemplate };
                mockEvent.currentTarget = buttons[buttons.length - 1];
                if (prefetchAndAttachLink || hoverToFetchAndAttachLink) onMouseInHandler(mockEvent);
                onClickHandler(mockEvent);
            }
        }

        if (event.altKey && (event.code === 'KeyL' || event.key == 'l')) {
            // right arrow
            let buttons = document.getElementsByClassName('_9zm2');
            if (buttons.length > 0) {
                buttons[0].click();
            }
        }

        if (event.altKey && (event.code === 'KeyJ' || event.key == 'j')) {
            // left arrow
            let buttons = document.getElementsByClassName('_9zm0');
            if (buttons.length > 0) {
                buttons[0].click();
            }
        }
    }

    function isPostPage() {
        return Boolean(window.location.href.match(postUrlPattern));
    }

    function queryHas(root, selector, has) {
        let nodes = root.querySelectorAll(selector);
        for (let i = 0; i < nodes.length; ++i) {
            let currentNode = nodes[i];
            if (currentNode.querySelector(has)) {
                return currentNode;
            }
        }
        return null;
    }

    // Keep the controls together; never attach them to an avatar or comment.
    const toolbarStyle = document.createElement('style');
    toolbarStyle.textContent = `
      .igdl-toolbar { display:inline-flex!important; flex-direction:row!important;
        align-items:center!important; gap:12px!important; flex-shrink:0!important;
        margin:0 8px!important; vertical-align:middle; }
      .igdl-toolbar .custom-btn { display:inline-flex!important; align-items:center;
        justify-content:center; width:28px; height:32px; margin:0!important;
        padding:0!important; flex-shrink:0; }
      .igdl-toolbar svg { width:24px!important; height:24px!important; }
    `;
    (document.head || document.documentElement).append(toolbarStyle);

    function isVisible(node) {
        return node.getClientRects().length > 0;
    }

    function findActionRow(save) {
        // Find the smallest shared action row, independent of generated class names.
        let row = save.parentElement;
        for (let depth = 0; row && depth < 6; depth++, row = row.parentElement) {
            if (row.matches('article, main, header, [role="dialog"]')) break;
            const controls = [...row.querySelectorAll('button, [role="button"]')]
                .filter(node => !node.closest('.igdl-toolbar') && isVisible(node));
            const labels = [...row.querySelectorAll('svg[aria-label]')]
                .map(node => node.getAttribute('aria-label') || '');
            if (controls.length >= 3 && labels.some(label =>
                /^(Like|Unlike|Comment|Share|Send|赞|取消赞|评论|分享|分享帖子|讚|取消讚|留言)$/i.test(label))) {
                return row;
            }
        }
        return null;
    }

    function mountToolbar(row, iconColor, appendNode) {
        if (!row || row.querySelector('.igdl-toolbar')) return;
        const toolbar = document.createElement('span');
        toolbar.className = 'igdl-toolbar';
        toolbar.setAttribute('aria-label', 'Instagram 下载工具');
        if (appendNode) appendNode(row, toolbar);
        else row.append(toolbar);
        addCustomBtn(toolbar, iconColor, append2Post);
    }

    function updateButtons() {
        if (!document.body) return;
        const curUrl = location.href;
        if (preUrl !== curUrl) {
            document.querySelectorAll('.igdl-toolbar, .custom-btn').forEach(node => node.remove());
            preUrl = curUrl;
        }
        const color = getComputedStyle(document.body).color || 'black';
        if (location.pathname.startsWith('/stories/')) {
            // Stories have a different control bar; retain the existing placement.
            if (!document.querySelector('.igdl-toolbar')) {
                const svg = [...document.querySelectorAll('svg[aria-label]')].find(node =>
                    /^(Pause|Play|暂停|播放|暫停)$/i.test(node.getAttribute('aria-label') || ''));
                const button = svg?.closest('button, [role="button"]');
                if (button?.parentElement) mountToolbar(button.parentElement, 'white');
            }
            return;
        }
        const saveIcons = [...document.querySelectorAll('svg')].filter(svg => {
            if (svg.closest('.igdl-toolbar')) return false;
            const label = svg.getAttribute('aria-label') || '';
            return /^(Save|Saved|Remove|Unsave|收藏|取消收藏|移除|保存|取消保存|儲存|已儲存)$/i.test(label) ||
                !!svg.querySelector('polygon[points="20 21 12 13.44 4 21 4 3 20 3 20 21"], path[d="M20 22a.999.999 0 0 1-.687-.273L12 14.815l-7.313 6.912A1 1 0 0 1 3 21V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1Z"]');
        });
        for (const svg of saveIcons) {
            if (!isVisible(svg)) continue;
            const save = svg.closest('button, [role="button"]');
            const row = save && findActionRow(save);
            if (row) mountToolbar(row, getComputedStyle(svg).color || color);
        }
        // Profile controls only belong on a profile page, never a post header.
        if (/^\/[^/]+\/?$/.test(location.pathname) &&
            !/^\/(explore|reels|direct|accounts)\/?$/.test(location.pathname)) {
            const header = document.querySelector('main header');
            const image = header?.querySelector('img');
            if (image && !header.querySelector('.igdl-toolbar')) mountToolbar(header, color);
        }
    }

    let updatePending = false;
    const observer = new MutationObserver(() => {
        if (updatePending) return;
        updatePending = true;
        setTimeout(() => { updatePending = false; updateButtons(); }, 150);
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
    setInterval(updateButtons, 1000); // Also handles history navigation and visibility changes.
    updateButtons();

    function append2Post(node, btn) {
        node.append(btn);
    }

    function append2IndependentPost(node, btn) {
        node.parentNode.parentNode.append(btn);
    }

    function append2Header(node, btn) {
        node.parentNode.parentNode.parentNode.appendChild(btn, node.parentNode.parentNode);
    }

    function append2Story(node, btn) {
        node.parentNode.parentNode.parentNode.append(btn);
    }

    function addCustomBtn(node, iconColor, appendNode) {
        // add download button and set event handlers
        // add newtab button
        let newtabBtn = createCustomBtn(svgNewtabBtn, iconColor, 'newtab-btn', '16px');
        appendNode(node, newtabBtn);

        // add download button
        let downloadBtn = createCustomBtn(svgDownloadBtn, iconColor, 'download-btn', '14px');
        appendNode(node, downloadBtn);

        if (prefetchAndAttachLink) {
            onMouseInHandler({ currentTarget: newtabBtn });
            onMouseInHandler({ currentTarget: downloadBtn });
        }
    }

    function createCustomBtn(svg, iconColor, className, marginLeft) {
        let newBtn = document.createElement('a');
        newBtn.innerHTML = svg.replace('%color', iconColor);
        newBtn.setAttribute('class', 'custom-btn ' + className);
        newBtn.setAttribute('target', '_blank');
        newBtn.setAttribute('style', 'cursor: pointer;margin-left: ' + marginLeft + ';margin-top: 8px;z-index: 999;');
        newBtn.onclick = onClickHandler;
        if (hoverToFetchAndAttachLink) newBtn.onmouseenter = onMouseInHandler;
        if (className.includes('newtab')) {
            newBtn.setAttribute('title', 'Open in new tab');
        } else {
            newBtn.setAttribute('title', 'Download');
        }
        return newBtn;
    }

    async function onClickHandler(e) {
        const target = e.currentTarget;
        e.stopPropagation();
        e.preventDefault();
        if (target.dataset.busy) return;
        target.dataset.busy = '1';
        target.setAttribute('aria-busy', 'true');
        try {
            if (location.pathname.startsWith('/stories/')) {
                await storyOnClicked(target);
            } else if (target.closest('header') && /^\/[^/]+\/?$/.test(location.pathname)) {
                await profileOnClicked(target);
            } else {
                await postOnClicked(target);
            }
        } catch (error) {
            alert('Instagram 下载器：' + error.message);
        } finally {
            delete target.dataset.busy;
            target.removeAttribute('aria-busy');
        }
    }

    function onMouseInHandler(e) {
        let target = e.currentTarget;
        if (!prefetchAndAttachLink && !hoverToFetchAndAttachLink) return;
        if (window.location.pathname.includes('stories')) {
            storyOnMouseIn(target).catch(() => target.removeAttribute('href'));
        } else if (target.closest('header') && /^\/[^/]+\/?$/.test(location.pathname)) {
            profileOnMouseIn(target);
        } else {
            postOnMouseIn(target);
        }
    }

    // ================================
    // ====        Profile         ====
    // ================================
    function profileOnMouseIn(target) {
        let url = profileGetUrl(target);
        target.setAttribute('href', url);
    }

    function profileOnClicked(target) {
        // extract profile picture url and download or open it
        let url = profileGetUrl(target);

        if (typeof url === 'string' && url.length > 0) {
            // check url
            if (target.getAttribute('class').includes('download-btn')) {
                // generate filename
                const filename = location.pathname.split('/').filter(Boolean)[0] || 'profile';
                downloadResource(url, filename);
            } else {
                // open url in new tab
                openResource(url);
            }
        }
    }

    function profileGetUrl(target) {
        let img = target.closest('header')?.querySelector('img');
        let url = img?.currentSrc || img?.src || '';
        return url;
    }

    // ================================
    // ====         Post           ====
    // ================================
    async function postOnMouseIn(target) {
        try {
            const articleNode = postGetArticleNode(target);
            const {url} = await postGetUrl(target, articleNode);
            if (url) target.setAttribute('href', url);
        } catch (_) { target.removeAttribute('href'); }
    }

    async function postOnClicked(target) {
        try {
            // extract url from target post and download or open it
            let articleNode = postGetArticleNode(target);
            let { url, mediaIndex } = await postGetUrl(target, articleNode);

            // download or open media url
            if (typeof url === 'string' && url.length > 0) {
                // check url
                if (target.getAttribute('class').includes('download-btn')) {
                    let mediaName = url
                        .split('?')[0]
                        .split('\\')
                        .pop()
                        .split('/')
                        .pop();
                    mediaName = mediaName.substring(0, mediaName.lastIndexOf('.'));
                    let datetime = new Date(articleNode.querySelector('time')?.getAttribute('datetime') || Date.now());
                    let posterName = articleNode.querySelector('header a') || findPostName(articleNode);
                    posterName = typeof posterName === 'string' ? posterName : (posterName?.getAttribute('href') || '/instagram/').replace(/\//g, '');
                    let postId = findPostId(articleNode);
                    let filename = filenameFormat(postFilenameTemplate, posterName, datetime, mediaName, postId, mediaIndex);
                    await downloadResource(url, filename);
                } else {
                    // open url in new tab
                    await openResource(url);
                }
            }
        } catch (e) {
            console.log(`Uncatched in postOnClicked(): ${e}\n${e.stack}`);
            alert('Instagram 下载失败：' + (e.message || e));
            return null;
        }
    }

    function postGetArticleNode(target) {
        const article = target.closest('article');
        if (article) return article;
        // Stop at the smallest container that contains this post's media and link.
        for (let node = target.parentElement; node; node = node.parentElement) {
            if (node.querySelector('video, img') &&
                [...node.querySelectorAll('a[href]')].some(a => postIdPattern.test(a.pathname))) return node;
            if (node.matches('main, [role="dialog"]')) return node;
        }
        throw new Error('找不到此按钮对应的帖子');
    }

    function visibleMedia(root) {
        const bounds = root.getBoundingClientRect();
        return [...root.querySelectorAll('video, img')].map(node => {
            const rect = node.getBoundingClientRect();
            let left = Math.max(0, bounds.left), right = Math.min(innerWidth, bounds.right);
            let top = Math.max(0, bounds.top), bottom = Math.min(innerHeight, bounds.bottom);
            // Carousel slides can exist in the DOM while clipped offscreen.
            for (let parent = node.parentElement; parent && parent !== root; parent = parent.parentElement) {
                const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
                if (/(hidden|clip|scroll|auto)/.test(style.overflowX)) {
                    left = Math.max(left, clip.left); right = Math.min(right, clip.right);
                }
                if (/(hidden|clip|scroll|auto)/.test(style.overflowY)) {
                    top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom);
                }
            }
            const area = Math.max(0, Math.min(right, rect.right) - Math.max(left, rect.left)) *
                Math.max(0, Math.min(bottom, rect.bottom) - Math.max(top, rect.top));
            return {node, area: rect.width >= 120 && rect.height >= 120 ? area : 0};
        }).filter(item => item.area > 0).sort((a, b) => b.area - a.area)[0]?.node;
    }

    async function postGetUrl(target, articleNode) {
        const media = visibleMedia(articleNode);
        if (!media) throw new Error('未找到可见的帖子图片或视频，请先将帖子滚动到屏幕内');
        const slide = media.closest('li');
        const slides = slide ? [...slide.parentElement.children].filter(node => node.tagName === 'LI') : [];
        const position = slide?.getAttribute('aria-posinset');
        const dots = [...articleNode.querySelectorAll('div._acnb')];
        const activeDot = dots.findIndex(node => node.classList.length === 2);
        let mediaIndex = position ? Number(position) - 1 : activeDot >= 0 ? activeDot : null;
        // Visible DOM media is authoritative when carousel indexing is unavailable.
        let url = media.currentSrc || media.src || media.querySelector('source')?.src || '';
        if (media.tagName === 'VIDEO' && (!url || url.startsWith('blob:'))) {
            if (mediaIndex === null && (slides.length > 1 || articleNode.querySelector('[aria-label^="Go to slide"]'))) {
                throw new Error('无法确定轮播视频序号，请打开这篇帖子后再下载');
            }
            url = await getUrlFromInfoApi(articleNode, mediaIndex ?? 0);
        }
        if (!url || !/^https?:/.test(url)) throw new Error('未取得可下载的媒体地址，请打开帖子后重试');
        return {url, mediaIndex: mediaIndex ?? 0};
    }

    function findHighlightsIndex() {
        let currentDivProgressbarDiv = document.querySelector('div[style^="transform"]').parentElement;
        let progressbarRootDiv = currentDivProgressbarDiv.parentElement;
        let progressbarDivs = progressbarRootDiv.children;
        return Array.from(progressbarDivs).indexOf(currentDivProgressbarDiv);
    }

    let infoCache = {}; // key: media id, value: info json
    let mediaIdCache = {}; // key: post id, value: media id
    async function getUrlFromInfoApi(articleNode, mediaIdx = 0) {
        // return media url if found else return null
        // fetch flow:
        //	 1. find post id
        //   2. use step1 post id to send request to get post page
        //   3. find media id from the reponse text of step2
        //   4. find app id in clicked page
        //   5. send info api request with media id and app id
        //   6. get media url from response json
        try {
            const appIdPattern = /"X-IG-App-ID":"([\d]+)"/;
            const mediaIdPattern = /instagram:\/\/media\?id=(\d+)|["' ]media_id["' ]:["' ](\d+)["' ]/;
            function findAppId() {
                let bodyScripts = document.querySelectorAll("body > script");
                for (let i = 0; i < bodyScripts.length; ++i) {
                    let match = bodyScripts[i].text.match(appIdPattern);
                    if (match) return match[1];
                }
                console.log("Cannot find app id");
                return null;
            }

            async function findMediaId() {
                // method 1: extract from url.
                function method1() {
                    let href = window.location.href;
                    let match = href.match(/www.instagram.com\/stories\/[^\/]+\/(\d+)/);
                    if (!href.includes('highlights') && match) return match[1];
                }

                // method 3
                async function method3() {
                    let postId = await findPostId(articleNode);
                    if (!postId) {
                        return null;
                    }

                    if (!(postId in mediaIdCache)) {
                        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
                        let id = 0n;
                        for (const char of postId) {
                            const digit = alphabet.indexOf(char);
                            if (digit < 0) return null;
                            id = id * 64n + BigInt(digit);
                        }
                        mediaIdCache[postId] = id.toString();
                    }
                    return mediaIdCache[postId];
                }

                function method2() {
                    let scriptJson = document.querySelectorAll('script[type="application/json"]');
                    for (let i = 0; i < scriptJson.length; i++) {
                        let match = scriptJson[i].text.match(/"pk":"(\d+)","id":"[\d_]+"/);
                        if (match) {
                            if (!window.location.href.includes('highlights')) {
                                return match[1];
                            }
                            let matchs = Array.from(scriptJson[i].text.matchAll(/"pk":"(\d+)","id":"[\d_]+"/g), match => match[1]);
                            const matchIndex = findHighlightsIndex();
                            if (matchs.length > matchIndex) {
                                return matchs[matchIndex];
                            }
                        }
                    }
                }

                return method1() || await method3() || (location.pathname.startsWith('/stories/') ? method2() : null);
            }

            function getImgOrVedioUrl(item) {
                if ("video_versions" in item) {
                    return item.video_versions[0].url;
                } else {
                    return item.image_versions2.candidates[0].url;
                }
            }

            let appId = findAppId();
            if (!appId) return null;
            let headers = {
                method: 'GET',
                headers: {
                    Accept: '*/*',
                    'X-IG-App-ID': appId
                },
                credentials: 'include',
                mode: 'cors'
            };

            let mediaId = await findMediaId();
            if (!mediaId) {
                console.log("Cannot find media id");
                return null;
            }
            if (!(mediaId in infoCache)) {
                let url = 'https://www.instagram.com/api/v1/media/' + mediaId + '/info/';
                let resp = await fetch(url, headers);
                if (resp.status !== 200) {
                    console.log(`Fetch info API failed with status code: ${resp.status}`);
                    return null;
                }
                let respJson = await resp.json();
                infoCache[mediaId] = respJson;
            }
            let infoJson = infoCache[mediaId];
            if ('carousel_media' in infoJson.items[0]) {
                // multi-media post
                return getImgOrVedioUrl(infoJson.items[0].carousel_media[mediaIdx]);
            } else {
                // single media post
                return getImgOrVedioUrl(infoJson.items[0]);
            }
        } catch (e) {
            console.log(`Uncatched in getUrlFromInfoApi(): ${e}\n${e.stack}`);
            return null;
        }
    }

    function findPostName(articleNode) {
        const link = [...articleNode.querySelectorAll('a[href]')].find(node =>
            /^\/[A-Za-z0-9_.]+\/$/.test(node.pathname) &&
            !/^\/(explore|reels|direct|accounts)\/$/.test(node.pathname));
        return link || 'instagram';
    }

    function findPostId(articleNode) {
        const pageMatch = location.pathname.match(postIdPattern);
        if (pageMatch && !articleNode?.closest('article')) return pageMatch[1];
        let aNodes = articleNode.querySelectorAll('a');
        for (let i = 0; i < aNodes.length; ++i) {
            let link = aNodes[i].getAttribute('href');
            if (link) {
                let match = link.match(postIdPattern);
                if (match) return match[1];
            }
        }
        return null;
    }

    async function fetchVideoURL(articleNode, videoElem) {
        let poster = videoElem.getAttribute('poster');
        let timeNodes = articleNode.querySelectorAll('time');
        // special thanks 孙年忠 (https://greasyfork.org/en/scripts/406535-instagram-download-button/discussions/120159)
        let posterUrl = timeNodes[timeNodes.length - 1].parentNode.parentNode.href;
        const posterPattern = /\/([^\/?]*)\?/;
        let posterMatch = poster.match(posterPattern);
        let postFileName = posterMatch[1];
        let resp = await fetch(posterUrl);
        let content = await resp.text();
        // special thanks to 孙年忠 for the pattern (https://greasyfork.org/zh-TW/scripts/406535-instagram-download-button/discussions/116675)
        const pattern = new RegExp(`${postFileName}.*?video_versions.*?url":("[^"]*")`, 's');
        let match = content.match(pattern);
        let videoUrl = JSON.parse(match[1]);
        videoUrl = videoUrl.replace(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g, 'https://scontent.cdninstagram.com');
        videoElem.setAttribute('videoURL', videoUrl);
        return videoUrl;
    }

    // ================================
    // ====   Story & Highlight    ====
    // ================================
    async function storyOnMouseIn(target) {
        let sectionNode = storyGetSectionNode(target);
        let url = await storyGetUrl(target, sectionNode);
        target.setAttribute('href', url);
    }

    async function storyOnClicked(target) {
        // extract url from target story and download or open it
        let sectionNode = storyGetSectionNode(target);
        let url = await storyGetUrl(target, sectionNode);
        const posterUrlPat = /\/stories\/(.*)\/.*\//
        // download or open media url
        if (target.getAttribute('class').includes('download-btn')) {
            let mediaName = url.split('?')[0].split('\\').pop().split('/').pop();
            mediaName = mediaName.substring(0, mediaName.lastIndexOf('.'));
            let datetime = new Date(sectionNode.querySelector('time').getAttribute('datetime'));
            let posterName = "unkown";
            // method 1
            const posterNameHeader = sectionNode.querySelector('header a');
            if (posterNameHeader) {
                posterName = posterNameHeader.getAttribute('href').replace(/\//g, '');
            }

            // method 2
            if (posterName === "unkown") {
                const match = window.location.pathname.match(posterUrlPat);
                if (match) {
                    posterName = match[1];
                }
            }
            let filename = filenameFormat(storyFilenameTemplate, posterName, datetime, mediaName);
            downloadResource(url, filename);
        } else {
            // open url in new tab
            openResource(url);
        }
    }

    function storyGetSectionNode(target) {
        let sectionNode = target;
        while (sectionNode && sectionNode.tagName !== 'SECTION') {
            sectionNode = sectionNode.parentNode;
        }
        return sectionNode;
    }

    async function storyGetUrl(target, sectionNode) {
        let url = null;
        if (!disableNewUrlFetchMethod) url = await getUrlFromInfoApi(target);

        if (!url) {
            if (sectionNode.querySelector('video > source')) {
                url = sectionNode.querySelector('video > source').getAttribute('src');
            } else if (sectionNode.querySelector('img[decoding="sync"]')) {
                let img = sectionNode.querySelector('img[decoding="sync"]');
                url = img.srcset.split(/ \d+w/g)[0].trim(); // extract first src from srcset attr. of img
                if (typeof url === 'string' && url.length > 0) {
                    return url;
                }
                url = sectionNode.querySelector('img[decoding="sync"]').getAttribute('src');
            } else if (sectionNode.querySelector('video')) {
                url = sectionNode.querySelector('video').getAttribute('src');
            }
        }
        return url;
    }

    function filenameFormat(template, id, datetime, medianame, postId = +new Date(), mediaIndex = '0') {
        let filename = template;
        filename = filename.replace(/%id%/g, id);
        filename = filename.replace(/%datetime%/g, datetimeFormat(datetimeTemplate, datetime));
        filename = filename.replace(/%medianame%/g, medianame);
        filename = filename.replace(/%postId%/g, postId);
        filename = filename.replace(/%mediaIndex%/g, mediaIndex);
        return filename;
    }

    function datetimeFormat(template, datetime) {
        let datetimeStr = template;
        datetimeStr = datetimeStr.replace(/%y%/g, datetime.getFullYear());
        datetimeStr = datetimeStr.replace(/%m%/g, fillZero((datetime.getMonth() + 1).toString()));
        datetimeStr = datetimeStr.replace(/%d%/g, fillZero(datetime.getDate().toString()));
        datetimeStr = datetimeStr.replace(/%H%/g, fillZero(datetime.getHours().toString()));
        datetimeStr = datetimeStr.replace(/%M%/g, fillZero(datetime.getMinutes().toString()));
        datetimeStr = datetimeStr.replace(/%S%/g, fillZero(datetime.getSeconds().toString()));
        return datetimeStr;
    }

    function fillZero(str) {
        if (str.length === 1) {
            return '0' + str;
        }
        return str;
    }

    async function requestResource(action, url, filename) {
        try {
            const result = await chrome.runtime.sendMessage({action, url, filename});
            if (!result?.ok) throw new Error(result?.error || '扩展未响应，请刷新 Instagram');
        } catch (error) {
            alert('Instagram 下载器：' + error.message);
        }
    }

    function openResource(url) {
        return requestResource('open', url);
    }

    function downloadResource(url, filename) {
        return requestResource('download', url, filename);
    }
})();
