const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '../extension');
function setup(fail = false) {
    let listener;
    const calls = [];
    const context = vm.createContext({URL, Date, chrome: {
        runtime: {id: 'test-extension', onMessage: {addListener(fn) {listener = fn;}}},
        downloads: {async download(options) {calls.push(options); if (fail) throw new Error('download blocked'); return 42;}},
        tabs: {async create(options) {calls.push(options);}}
    }});
    vm.runInContext(fs.readFileSync(path.join(root, 'background.js'), 'utf8'), context);
    const sender = {id:'test-extension', tab:{id:1}, url:'https://www.instagram.com/'};
    const request = (message) => new Promise(resolve => listener(message, sender, resolve));
    return {context, calls, listener, request};
}
test('manifest contains only download permission and Instagram injection', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json')));
    assert.equal(manifest.manifest_version, 3);
    assert.deepEqual(manifest.permissions, ['downloads']);
    assert.deepEqual(manifest.content_scripts[0].matches, ['https://www.instagram.com/*']);
    assert.ok(fs.existsSync(path.join(root, manifest.background.service_worker)));
    for (const file of manifest.content_scripts[0].js) assert.ok(fs.existsSync(path.join(root, file)));
});
test('download keeps signed URL and sanitizes filename into a fixed folder', async () => {
    const {request, calls} = setup();
    const url = 'https://scontent-hkg4-1.cdninstagram.com/photo.jpg?signature=example';
    const result = await request({action:'download', url, filename:'../author/name:photo'});
    assert.equal(result.ok, true);
    assert.equal(calls[0].url, url);
    assert.equal(calls[0].filename, 'Instagram/_author_name_photo.jpg');
    assert.equal(calls[0].conflictAction, 'uniquify');
});
test('rejects untrusted hosts, misleading suffixes and unsupported schemes', async () => {
    const {request, calls} = setup();
    for (const url of ['https://evil.test/a.mp4','https://cdninstagram.com.evil.test/a.jpg',
        'blob:https://www.instagram.com/test','javascript:alert(1)',
        'https://user:pass@cdninstagram.com/a.jpg','https://cdninstagram.com:8443/a.jpg']) {
        assert.equal((await request({action:'download', url})).ok, false);
    }
    assert.equal(calls.length, 0);
});
test('rejects messages outside the Instagram content script', () => {
    const {listener, calls} = setup();
    assert.equal(listener({action:'download'}, {id:'other',url:'https://www.instagram.com/',tab:{}}, () => assert.fail()), false);
    assert.equal(listener({action:'download'}, {id:'test-extension',url:'https://evil.test/',tab:{}}, () => assert.fail()), false);
    assert.equal(calls.length, 0);
});
test('opens media in a new tab', async () => {
    const {request, calls} = setup();
    assert.equal((await request({action:'open',url:'https://video.fbcdn.net/a.mp4'})).ok, true);
    assert.equal(calls[0].url, 'https://video.fbcdn.net/a.mp4');
});
test('reports browser download rejection', async () => {
    const {request} = setup(true);
    const result = await request({action:'download',url:'https://video.fbcdn.net/a.mp4'});
    assert.equal(result.ok, false);
    assert.equal(result.error, 'download blocked');
});
