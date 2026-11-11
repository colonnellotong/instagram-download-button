// Adapted project: y252328/Instagram_Download_Button (MIT). See LICENSE.
'use strict';

function mediaUrl(value) {
    if (typeof value !== 'string') throw new Error('媒体地址无效');
    const url = new URL(value);
    const allowed = ['cdninstagram.com', 'fbcdn.net', 'instagram.com'];
    if (url.protocol !== 'https:' || url.username || url.password || url.port ||
        !allowed.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) {
        throw new Error('仅支持 Instagram 媒体地址');
    }
    return url;
}

function downloadFilename(name, url) {
    const extension = url.pathname.match(/\.(jpe?g|png|webp|gif|avif|mp4|mov)$/i)?.[0].toLowerCase() || '';
    const clean = String(name || 'instagram-' + Date.now())
        .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '_')
        .replace(/^\.+/, '').replace(/[. ]+$/, '').slice(0, 160) || 'instagram';
    return 'Instagram/' + clean + (extension && !clean.toLowerCase().endsWith(extension) ? extension : '');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id ||
        !sender.tab || !sender.url?.startsWith('https://www.instagram.com/')) return false;
    if (!message || !['download', 'open'].includes(message.action)) return false;
    (async () => {
        try {
            const url = mediaUrl(message.url);
            if (message.action === 'open') {
                await chrome.tabs.create({url: url.href});
                sendResponse({ok: true});
            } else {
                const id = await chrome.downloads.download({
                    url: url.href,
                    filename: downloadFilename(message.filename, url),
                    conflictAction: 'uniquify'
                });
                sendResponse({ok: true, id});
            }
        } catch (error) {
            sendResponse({ok: false, error: error.message || '操作失败'});
        }
    })();
    return true;
});
