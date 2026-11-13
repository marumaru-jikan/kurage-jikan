// オフラインでも開けるように、アプリのファイルを端末に保存しておく
// 中身を更新したら VERSION の数字を1つ上げてください
const VERSION = 'kurage-v137';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];  // 海月の画像は、一度見たものから順に保存されます

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('kurage-') && k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, (e.request.mode === 'navigate' || /\/(index\.html)?$|sw\.js$/.test(new URL(e.request.url).pathname)) ? { cache: 'no-cache' } : {}).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
