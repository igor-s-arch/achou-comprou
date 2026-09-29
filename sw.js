const CACHE='achou-comprou-v94';
const APP=[
  './',
  './index.html',
  './styles.css?v=94',
  './app.js?v=94',
  './supabase-config.js',
  './supabase-adapter.js?v=94',
  './manifest.webmanifest',
  './assets/logo-achou-comprou.png',
  './Imagem%20ChatGPT%2028_09_2026,%2016_35_24.png',
  './Imagem%20ChatGPT%2028_09_2026,%2017_16_39.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});

self.addEventListener('push',event=>{
  let payload={title:'Achou, Comprou',body:'Você tem uma nova notificação.',url:'./',tag:'achou-comprou'};
  try{
    if(event.data)payload={...payload,...event.data.json()};
  }catch(_){}
  event.waitUntil(
    self.registration.showNotification(payload.title,{
      body:payload.body,
      icon:'./assets/logo-achou-comprou.png',
      badge:'./assets/logo-achou-comprou.png',
      tag:payload.tag||'achou-comprou',
      renotify:true,
      data:{url:payload.url||'./'}
    })
  );
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./',self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clients=>{
      const existing=clients.find(client=>client.url.startsWith(self.location.origin));
      if(existing){
        existing.navigate?.(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
