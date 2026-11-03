const V='dm2',SH=['./','index.html','style.css','app.js','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(SH))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=V&&x!='img').map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!='GET')return;
if(u.hostname.startsWith('images.')){e.respondWith(caches.open('img').then(async c=>{const m=await c.match(r);if(m)return m;const n=await fetch(r);c.put(r,n.clone());return n}));return}
if(u.hostname.includes('ygoprodeck'))return;
e.respondWith(fetch(r).then(n=>{const k=n.clone();caches.open(V).then(c=>c.put(r,k));return n}).catch(()=>caches.match(r)))});
