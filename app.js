const app = document.getElementById('app');

const state = {
  favorites: new Set(['p1']),
  storePlan: 'gratis',
  stores: [
    { name: 'Maranhão Calçados', cat: 'Moda e Calçados', dist: '0,8 km', rating: '4,9', status: 'aprovada', plan: 'premium_banner' },
    { name: 'Bella Store', cat: 'Moda Feminina', dist: '1,1 km', rating: '4,8', status: 'aguardando', plan: 'gratis' },
    { name: 'Tech Cell', cat: 'Celulares', dist: '1,3 km', rating: '4,7', status: 'aprovada', plan: 'premium' },
    { name: 'Casa & Cia', cat: 'Utilidades', dist: '1,4 km', rating: '4,6', status: 'aprovada', plan: 'gratis' }
  ]
};


const DB_KEY = 'achou_comprou_mvp_v17';
const DEFAULT_DB = {
  merchants: [
    { id: 'loja-maranhao', owner: 'Lojista Demo', name: 'Maranhão Calçados', category: 'Moda e Calçados', whatsapp: '(99) 99999-9999', instagram: '@maranhaoliveshop.gr', address: 'Grajaú - MA', hours: 'Seg a Sáb, 8h às 18h', description: 'Moda, calçados e acessórios.', email: 'lojista@exemplo.com', password: '123456', status: 'aprovada', plan: 'premium_banner', rating: '4,9', dist: '0,8 km' },
    { id: 'bella-store', owner: 'Demo', name: 'Bella Store', category: 'Moda Feminina', whatsapp: '', instagram: '@bellastore', address: 'Grajaú - MA', hours: 'Seg a Sáb', description: 'Moda feminina e novidades.', email: 'bella@demo.local', password: '123456', status: 'aprovada', plan: 'premium', rating: '4,8', dist: '1,1 km' },
    { id: 'pizzaria-cheff', owner: 'Demo', name: 'Pizzaria do Cheff', category: 'Alimentação', whatsapp: '', instagram: '', address: 'Grajaú - MA', hours: '18h às 23h', description: 'Pizzas e lanches.', email: 'pizza@demo.local', password: '123456', status: 'aprovada', plan: 'gratis', rating: '4,7', dist: '1,5 km' }
  ],
  products: [
    { id:'p1', storeId:'loja-maranhao', type:'calcado', art:'shoe', name:'Tênis Infantil', brand:'', price:'159,90', promo:'129,90', details:'Tênis infantil com numerações e cores disponíveis', numbers:['26','27','28','29','30'], sizes:[], colors:['Preto','Azul','Rosa'], variants:[{option:'28',color:'Rosa',qty:2},{option:'28',color:'Preto',qty:2},{option:'29',color:'Azul',qty:1},{option:'30',color:'Preto',qty:2}], stock:'detalhado', status:'ativo' },
    { id:'p2', storeId:'loja-maranhao', type:'roupa', art:'shirt', name:'Blusinha casual', brand:'', price:'49,90', promo:'39,90', details:'Blusinha casual feminina', numbers:[], sizes:['P','M','G'], colors:['Preto','Branco','Rosa'], variants:[{option:'P',color:'Preto',qty:3},{option:'M',color:'Branco',qty:2},{option:'G',color:'Rosa',qty:1}], stock:'detalhado', status:'ativo' },
    { id:'p3', storeId:'bella-store', type:'roupa', art:'shirt', name:'Vestido Midi', brand:'', price:'119,90', promo:'99,90', details:'Vestido feminino em tecido leve', numbers:[], sizes:['M','G'], colors:['Preto','Rosa'], variants:[{option:'M',color:'Preto',qty:2},{option:'M',color:'Rosa',qty:1},{option:'G',color:'Preto',qty:1}], stock:'detalhado', status:'ativo' },
    { id:'p4', storeId:'pizzaria-cheff', type:'pizza', art:'pizza', name:'Pizza Grande', brand:'', price:'49,90', promo:'39,90', details:'Sabores: Calabresa, Frango e Mussarela', numbers:[], sizes:['Grande'], colors:[], variants:[{option:'Grande',color:'',qty:20}], stock:'detalhado', status:'ativo' }
  ],
  offers: [{ id:'o1', storeId:'loja-maranhao', productId:'p1', normal:'159,90', promo:'129,90', validUntil:'2026-12-31', quantity:10, active:true }],
  banners: [{ id:'b1', storeId:'loja-maranhao', title:'Compre no comércio local', message:'Ofertas especiais perto de você', active:true }],
  payments: [],
  paymentConfig: { pixKey:'', pixName:'', pixCity:'Grajaú - MA', instruction:'Após fazer o PIX, envie o comprovante para análise.' },
  clients: [{ id:'cliente-demo', name:'Cliente Demo', email:'cliente@exemplo.com', password:'123456', phone:'(99) 99999-0000', city:'Grajaú - MA', favorites:['p1'] }],
  recentSearches: ['tênis infantil número 28','vestido tamanho M'],
  notifications: [
    { id:'n1', title:'Nova oferta perto de você', text:'O Tênis Infantil está com preço promocional na Maranhão Calçados.', type:'offer', read:false },
    { id:'n2', title:'Bem-vindo ao Achou, Comprou', text:'Pesquise produtos e encontre lojas da sua cidade em poucos segundos.', type:'system', read:true }
  ],
  clientSettings: { offers:true, favorites:true, local:true },
  session: { clientId: null, merchantId: null, admin: false }
};
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadDb() { try { const raw = localStorage.getItem(DB_KEY) || localStorage.getItem('achou_comprou_mvp_v16'); const saved = JSON.parse(raw); if (saved && saved.merchants && saved.products && saved.offers) { saved.clients = Array.isArray(saved.clients) ? saved.clients.map(c => ({...c, favorites:Array.isArray(c.favorites)?c.favorites:[], phone:c.phone||'', city:c.city||'Grajaú - MA'})) : []; saved.merchants = Array.isArray(saved.merchants) ? saved.merchants.map(m => ({...m, logoData:m.logoData||'', coverData:m.coverData||''})) : []; saved.products = Array.isArray(saved.products) ? saved.products.map(p => ({...p, imageData:p.imageData||'', images:Array.isArray(p.images)&&p.images.length?p.images.filter(Boolean):(p.imageData?[p.imageData]:[])})) : []; saved.payments = Array.isArray(saved.payments) ? saved.payments : []; saved.paymentConfig = saved.paymentConfig || { pixKey:'', pixName:'', pixCity:'Grajaú - MA', instruction:'Após fazer o PIX, envie o comprovante para análise.' }; saved.recentSearches = Array.isArray(saved.recentSearches) ? saved.recentSearches : []; saved.notifications = Array.isArray(saved.notifications) ? saved.notifications : []; saved.clientSettings = saved.clientSettings || { offers:true, favorites:true, local:true }; saved.session = saved.session || {}; saved.session.clientId = saved.session.clientId || null; saved.session.merchantId = saved.session.merchantId || null; saved.session.admin = !!saved.session.admin; return saved; } } catch (_) {} return clone(DEFAULT_DB); }
let db = loadDb();
let adminBranding={
  name:'Igor',
  role:'Administrador',
  subtitle:'Controle da plataforma em um só lugar.',
  logoUrl:'',
  bannerUrl:'',
  avatarUrl:''
};
async function loadAdminBranding(){
  if(!window.ACCloud?.enabled)return adminBranding;
  const result=await window.ACCloud.getAdminBranding?.();
  if(result?.ok && result.config)adminBranding={...adminBranding,...result.config};
  return adminBranding;
}
function saveDb() { try { localStorage.setItem(DB_KEY, JSON.stringify(db)); return true; } catch (err) { console.error('Falha ao salvar dados locais', err); alert('O navegador ficou sem espaço para salvar novas imagens. Use arquivos menores ou remova imagens antigas.'); return false; } }
function upsertCloudClient(profile,user){
  if(!user) return;
  db.clients=db.clients||[];
  const existing=db.clients.find(c=>c.id===user.id);
  const next={
    id:user.id,
    name:profile?.nome||user.user_metadata?.nome||user.user_metadata?.name||user.email?.split('@')[0]||'Cliente',
    email:user.email||'', password:'', phone:profile?.telefone||'', city:'Grajaú - MA',
    avatar:profile?.avatar_url||existing?.avatar||'',
    favorites:existing?.favorites||[]
  };
  if(existing) Object.assign(existing,next); else db.clients.push(next);
  saveDb();
}
function upsertCloudMerchant(store,user){
  if(!store||!user) return;
  const existing=db.merchants.find(m=>m.id===store.id);
  const next={
    id:store.id, ownerId:user.id, owner:user.user_metadata?.nome||user.user_metadata?.name||user.email?.split('@')[0]||'Lojista',
    name:store.nome||'Minha loja', category:store.categoria_texto||'Outros',
    categories:Array.isArray(store.categorias)&&store.categorias.length?store.categorias:[store.categoria_texto||'Outros'],
    whatsapp:store.whatsapp||'',
    instagram:store.instagram||'', address:store.endereco||'Grajaú - MA', hours:store.horario_funcionamento||'',
    weeklyHours:store.horarios_semanais&&typeof store.horarios_semanais==='object'?store.horarios_semanais:(existing?.weeklyHours||{}),
    description:store.descricao||'', email:user.email||'', password:'', status:store.status||'aguardando',
    storedPlan:store.plano_id||'gratis',
    plan:(store.plano_id&&store.plano_id!=='gratis'&&(!store.plano_ativo_ate||new Date(store.plano_ativo_ate).getTime()<=Date.now()))?'gratis':(store.plano_id||'gratis'),
    planExpiresAt:store.plano_ativo_ate||'', requestedPlan:store.plano_solicitado||null,
    rating:store.avaliacao?String(store.avaliacao).replace('.',','):'Novo', dist:'—',
    logoData:store.logo_url||'', coverData:store.capa_url||''
  };
  if(existing) Object.assign(existing,next); else db.merchants.push(next);
  saveDb();
}
function currentMerchant() { return db.merchants.find(m => m.id === db.session.merchantId) || null; }
function currentClient() { return (db.clients || []).find(c => c.id === db.session.clientId) || null; }
function isFavorite(productId) { const c=currentClient(); return !!(c && Array.isArray(c.favorites) && c.favorites.includes(productId)); }
function saveFavorite(productId, active) { const c=currentClient(); if(!c) return false; c.favorites=Array.isArray(c.favorites)?c.favorites:[]; c.favorites=active ? Array.from(new Set([...c.favorites, productId])) : c.favorites.filter(id=>id!==productId); saveDb(); return true; }
async function finishClientAccess(clientId) { db.session.admin=false; db.session.merchantId=null; db.session.clientId=clientId; await syncCloudFavorites(clientId); const pending=publicState.afterLogin; if(pending?.favoriteId) await setFavorite(pending.favoriteId,true); publicState.afterLogin=null; saveDb(); if(pending?.screen==='product' && pending.productId) return product(pending.productId); if(pending?.screen==='favorites') return favorites(); profile(); }
function id(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2,8)}`; }
function esc(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function planLabel(plan) { return ({gratis:'Grátis', premium:'Premium', premium_banner:'Premium + Banner'})[plan] || 'Grátis'; }
function planPrice(plan){return ({gratis:0,premium:49.90,premium_banner:59.90})[plan]??0;}
function brlNumber(value){return Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function formatDateBR(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('pt-BR');}
function paymentStatusLabel(status){return ({aguardando:'Aguardando PIX',em_analise:'Em análise',pago:'Pago',recusado:'Recusado',cancelado:'Cancelado',vencido:'Vencido'})[status]||status;}
function paymentStatusClass(status){return ({pago:'ok',em_analise:'wait',aguardando:'wait',recusado:'bad',cancelado:'blocked',vencido:'bad'})[status]||'wait';}
function paymentById(id){return (db.payments||[]).find(p=>p.id===id)||null;}

function pixEmvField(id,value){
  const text=String(value??'');
  return `${id}${String(text.length).padStart(2,'0')}${text}`;
}
function pixText(value,maxLength){
  return String(value||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toUpperCase().replace(/[^A-Z0-9 ]+/g,' ')
    .replace(/\s+/g,' ').trim().slice(0,maxLength);
}
function pixCrc16(payload){
  let crc=0xFFFF;
  for(let i=0;i<payload.length;i++){
    crc^=payload.charCodeAt(i)<<8;
    for(let bit=0;bit<8;bit++) crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1);
    crc&=0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4,'0');
}
function buildPixCopyPaste({key,name,city,amount}){
  const pixKey=String(key||'').trim();
  if(!pixKey)return '';
  const merchantAccount=pixEmvField('00','br.gov.bcb.pix')+pixEmvField('01',pixKey);
  const merchantName=pixText(name||'ACHOU COMPROU',25)||'ACHOU COMPROU';
  const merchantCity=pixText(city||'GRAJAU',15)||'GRAJAU';
  const value=Number(amount||0);
  let payload=
    pixEmvField('00','01')+
    pixEmvField('26',merchantAccount)+
    pixEmvField('52','0000')+
    pixEmvField('53','986')+
    (value>0?pixEmvField('54',value.toFixed(2)):'')+
    pixEmvField('58','BR')+
    pixEmvField('59',merchantName)+
    pixEmvField('60',merchantCity)+
    pixEmvField('62',pixEmvField('05','***'))+
    '6304';
  return payload+pixCrc16(payload);
}


const STORE_WEEK_DAYS=[
  {key:'seg',label:'Segunda-feira',short:'Seg'},
  {key:'ter',label:'Terça-feira',short:'Ter'},
  {key:'qua',label:'Quarta-feira',short:'Qua'},
  {key:'qui',label:'Quinta-feira',short:'Qui'},
  {key:'sex',label:'Sexta-feira',short:'Sex'},
  {key:'sab',label:'Sábado',short:'Sáb'},
  {key:'dom',label:'Domingo',short:'Dom'}
];
function defaultWeeklyHours(){
  const result={};
  STORE_WEEK_DAYS.forEach((day,index)=>{result[day.key]={closed:index===6,open:'08:00',close:'18:00'};});
  return result;
}
function normalizeWeeklyHours(value){
  const base=defaultWeeklyHours();
  if(!value||typeof value!=='object')return base;
  STORE_WEEK_DAYS.forEach(day=>{
    const current=value[day.key];
    if(current&&typeof current==='object'){
      base[day.key]={
        closed:!!current.closed,
        open:/^\d{2}:\d{2}$/.test(String(current.open||''))?String(current.open):'08:00',
        close:/^\d{2}:\d{2}$/.test(String(current.close||''))?String(current.close):'18:00'
      };
    }
  });
  return base;
}
function weeklyHoursMarkup(prefix,value){
  const schedule=normalizeWeeklyHours(value);
  return `<div class="weekly-hours-editor" data-hours-prefix="${prefix}">
    ${STORE_WEEK_DAYS.map(day=>{
      const h=schedule[day.key];
      return `<div class="weekly-hours-row" data-hours-day="${day.key}">
        <div class="weekly-day"><b>${day.label}</b></div>
        <div class="weekly-time-fields">
          <input type="time" id="${prefix}_${day.key}_open" value="${esc(h.open)}" ${h.closed?'disabled':''} aria-label="Abertura ${day.label}">
          <span>até</span>
          <input type="time" id="${prefix}_${day.key}_close" value="${esc(h.close)}" ${h.closed?'disabled':''} aria-label="Fechamento ${day.label}">
        </div>
        <label class="weekly-closed-toggle"><input type="checkbox" id="${prefix}_${day.key}_closed" ${h.closed?'checked':''}><span>Fechado</span></label>
      </div>`;
    }).join('')}
  </div>`;
}
function bindWeeklyHoursEditor(prefix){
  STORE_WEEK_DAYS.forEach(day=>{
    const closed=document.getElementById(`${prefix}_${day.key}_closed`);
    const open=document.getElementById(`${prefix}_${day.key}_open`);
    const close=document.getElementById(`${prefix}_${day.key}_close`);
    const sync=()=>{
      const isClosed=!!closed?.checked;
      if(open)open.disabled=isClosed;
      if(close)close.disabled=isClosed;
      closed?.closest('.weekly-hours-row')?.classList.toggle('is-closed',isClosed);
    };
    closed?.addEventListener('change',sync);
    sync();
  });
}
function collectWeeklyHours(prefix){
  const data={};
  let openDays=0;
  for(const day of STORE_WEEK_DAYS){
    const closed=!!document.getElementById(`${prefix}_${day.key}_closed`)?.checked;
    const open=document.getElementById(`${prefix}_${day.key}_open`)?.value||'';
    const close=document.getElementById(`${prefix}_${day.key}_close`)?.value||'';
    if(!closed){
      openDays++;
      if(!open||!close)return {ok:false,message:`Informe os horários de ${day.label}.`};
      if(open>=close)return {ok:false,message:`Em ${day.label}, o horário de fechamento deve ser depois da abertura.`};
    }
    data[day.key]={closed,open:open||'08:00',close:close||'18:00'};
  }
  if(!openDays)return {ok:false,message:'Marque pelo menos um dia em que a loja funciona.'};

  const groups=[];
  STORE_WEEK_DAYS.forEach((day,index)=>{
    const h=data[day.key];
    const signature=h.closed?'closed':`${h.open}-${h.close}`;
    const last=groups[groups.length-1];
    if(last&&last.signature===signature){last.end=index;}
    else groups.push({start:index,end:index,signature,h});
  });
  const summary=groups.map(group=>{
    const first=STORE_WEEK_DAYS[group.start].short;
    const last=STORE_WEEK_DAYS[group.end].short;
    const days=group.start===group.end?first:`${first} a ${last}`;
    return group.h.closed?`${days}: Fechado`:`${days}: ${group.h.open}–${group.h.close}`;
  }).join(' · ');
  return {ok:true,data,summary};
}

function money(value) { const n = String(value || '').replace(/[^0-9,]/g,''); return n ? `R$ ${n}` : 'R$ 0,00'; }
function merchantProductsFor(storeId) { return db.products.filter(p => p.storeId === storeId); }
function merchantOffersFor(storeId) { return db.offers.filter(o => o.storeId === storeId); }
function syncPublicStoreState() { state.stores = db.merchants.map(m => ({ name:m.name, cat:m.category, dist:m.dist || '—', rating:m.rating || 'Novo', status:m.status, plan:m.plan, id:m.id })); }
syncPublicStoreState();

function applyCloudPublicCatalog(catalog){
  if(!catalog?.ok)return false;
  db.merchants=Array.isArray(catalog.stores)?catalog.stores:[];
  db.products=Array.isArray(catalog.products)?catalog.products:[];
  db.offers=Array.isArray(catalog.offers)?catalog.offers:[];
  db.banners=Array.isArray(catalog.banners)?catalog.banners:[];
  syncPublicStoreState();
  saveDb();
  return true;
}
async function syncCloudPublicCatalog(){
  if(!window.ACCloud?.enabled)return false;
  const result=await window.ACCloud.loadPublicCatalog();
  return applyCloudPublicCatalog(result);
}
function applyCloudAdminData(result){
  if(!result?.ok)return false;
  db.merchants=result.stores||[];db.products=result.products||[];db.offers=result.offers||[];db.banners=result.banners||[];
  syncPublicStoreState();saveDb();return true;
}
async function syncCloudAdminData(){
  if(!window.ACCloud?.enabled)return false;
  const result=await window.ACCloud.loadAdminData();
  return applyCloudAdminData(result);
}
async function syncCloudMerchantCatalog(storeId){
  if(!window.ACCloud?.enabled||!storeId)return false;
  const result=await window.ACCloud.loadMerchantCatalog(storeId);
  if(!result.ok)return false;
  db.products=db.products.filter(p=>p.storeId!==storeId).concat(result.products||[]);
  db.offers=db.offers.filter(o=>o.storeId!==storeId).concat(result.offers||[]);
  saveDb();
  return true;
}
async function syncMerchantPayments(storeId){
  if(!window.ACCloud?.enabled||!storeId)return false;
  const result=await window.ACCloud.loadMerchantPayments(storeId);
  if(!result.ok)return false;
  db.payments=result.payments||[];
  if(result.config)db.paymentConfig=result.config;
  saveDb();
  return true;
}
async function syncAdminPayments(){
  if(!window.ACCloud?.enabled)return false;
  const result=await window.ACCloud.loadAdminPayments();
  if(!result.ok)return false;
  db.payments=result.payments||[];
  if(result.config)db.paymentConfig=result.config;
  saveDb();
  return true;
}
async function syncCloudFavorites(userId){
  if(!window.ACCloud?.enabled||!userId)return false;
  const result=await window.ACCloud.getFavoriteProductIds(userId);
  if(!result.ok)return false;
  const c=(db.clients||[]).find(x=>x.id===userId);
  if(c){c.favorites=result.ids||[];saveDb();}
  return true;
}
async function setFavorite(productId,active){
  const c=currentClient();
  if(!c)return false;
  if(window.ACCloud?.enabled){
    const result=await window.ACCloud.setFavoriteProduct(c.id,productId,active);
    if(!result.ok){alert(result.message||'Não foi possível atualizar seus favoritos.');return false;}
  }
  saveFavorite(productId,active);
  if(window.ACCloud?.enabled){
    const p=db.products.find(x=>x.id===productId);
    if(active&&p) window.ACCloud.trackEvent('favorito',{storeId:p.storeId,productId:p.id}).catch(()=>{});
  }
  return true;
}

const publicState = { productId: 'p1', storeId: 'loja-maranhao', query: '', merchantPlanIntent:'', merchantDraft:null, merchantExistingAccount:null, afterLogin:null, passwordRecovery:false, filters: { category:'', option:'', color:'', maxPrice:'' } };

function normalizeText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function storePriority(plan) { return ({ premium_banner: 3, premium: 2, gratis: 1 })[plan] || 0; }
function storeRatingValue(store){ return Number(String(store?.rating ?? 0).replace(',','.')) || 0; }
function storeWhatsappValue(store){ return Number(store?.whatsappClicks || 0) || 0; }
function storeVisitValue(store){ return Number(store?.storeVisits || 0) || 0; }
function compareStorePriority(a,b){
  return (storePriority(b?.plan)-storePriority(a?.plan))
    || (storeRatingValue(b)-storeRatingValue(a))
    || (storeWhatsappValue(b)-storeWhatsappValue(a))
    || (storeVisitValue(b)-storeVisitValue(a))
    || String(a?.name||'').localeCompare(String(b?.name||''),'pt-BR');
}
function approvedStores() { return db.merchants.filter(m => m.status === 'aprovada').sort(compareStorePriority); }
function storeById(id) { return db.merchants.find(m => m.id === id) || null; }
function publicPremiumBanners() {
  const now=Date.now();
  return (db.banners||[]).filter(b=>{
    const m=storeById(b.storeId);
    const starts=!b.start || Number.isNaN(new Date(b.start).getTime()) || new Date(b.start).getTime()<=now;
    const ends=!b.end || Number.isNaN(new Date(b.end).getTime()) || new Date(b.end).getTime()>now;
    return !!b.active && starts && ends && m?.status==='aprovada' && m?.plan==='premium_banner';
  }).sort((a,b)=>(Number(a.order||0)-Number(b.order||0)) || String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
}
function publicProducts() {
  const approved = new Set(approvedStores().map(m => m.id));
  return db.products.filter(p => p.status === 'ativo' && approved.has(p.storeId));
}
function activeOfferFor(productId) {
  const today = new Date(); today.setHours(0,0,0,0);
  return db.offers.find(o => o.productId === productId && o.active && (!o.validUntil || new Date(`${o.validUntil}T23:59:59`) >= today)) || null;
}
function currentPrice(product) { const offer = activeOfferFor(product.id); return offer?.promo || product.promo || product.price; }
function originalPrice(product) { const offer = activeOfferFor(product.id); return offer?.normal || product.price; }
function discountFor(product) {
  const normal = Number(String(originalPrice(product)).replace(/\./g,'').replace(',','.').replace(/[^0-9.]/g,''));
  const promo = Number(String(currentPrice(product)).replace(/\./g,'').replace(',','.').replace(/[^0-9.]/g,''));
  if (!normal || !promo || promo >= normal) return '';
  return `-${Math.round((1 - promo / normal) * 100)}%`;
}
function publicOffers() {
  return publicProducts()
    .map(p => ({ product: p, offer: activeOfferFor(p.id), store: storeById(p.storeId) }))
    .filter(x => x.offer && x.store)
    .sort((a,b) => compareStorePriority(a.store,b.store)
      || String(b.offer?.createdAt||'').localeCompare(String(a.offer?.createdAt||'')));
}
function rankedPublicProducts(){
  return publicProducts()
    .map(p=>({product:p,offer:activeOfferFor(p.id),store:storeById(p.storeId)}))
    .filter(x=>x.store && x.store.plan!=='gratis')
    .sort((a,b)=>compareStorePriority(a.store,b.store)
      || Number(!!b.offer)-Number(!!a.offer)
      || String(a.product?.name||'').localeCompare(String(b.product?.name||''),'pt-BR'));
}
const COLOR_WORDS = ['preto','preta','branco','branca','rosa','azul','vermelho','vermelha','verde','amarelo','amarela','bege','marrom','cinza','roxo','roxa','laranja','dourado','dourada','prata'];
const SIZE_WORDS = ['pp','p','m','g','gg','xg','xxg','rn','0-3m','3-6m','6-9m','9-12m'];
const SEARCH_STOP = new Set(['de','da','do','das','dos','com','para','por','em','ate','até','menos','abaixo','reais','real','r','tamanho','numero','n','nº','cor']);
function splitList(value='') { return String(value).split(/[,;|]/).map(x => x.trim()).filter(Boolean); }
function priceNumber(value) { return Number(String(value || '').replace(/\./g,'').replace(',','.').replace(/[^0-9.]/g,'')) || 0; }
function inferType(text) {
  const n = normalizeText(text);
  if (/\b(tenis|sapato|sandalia|chinelo|bota|calcado)\b/.test(n)) return 'calcado';
  if (/\b(vestido|blusa|blusinha|camisa|camiseta|calca|short|saia|roupa)\b/.test(n)) return 'roupa';
  if (/\b(pizza|lanche|hamburguer|comida|restaurante)\b/.test(n)) return 'pizza';
  if (/\b(perfume|cosmetico|maquiagem|shampoo|beleza)\b/.test(n)) return 'beleza';
  if (/\b(celular|smartphone|iphone|android)\b/.test(n)) return 'celular';
  return '';
}
function parseSearchIntent(query='') {
  const raw = String(query || '');
  const n = normalizeText(raw);
  const maxMatch = n.match(/(?:ate|menos de|abaixo de)\s*(?:r\s*)?(\d+(?:[.,]\d+)?)/);
  const color = COLOR_WORDS.find(c => new RegExp(`\\b${c}\\b`).test(n)) || '';
  let size = '';
  for (const candidate of SIZE_WORDS) if (new RegExp(`(?:tamanho\\s+)?\\b${candidate.replace('-','\\-')}\\b`,'i').test(n)) { size = candidate.toUpperCase(); break; }
  const type = inferType(n);
  let number = '';
  const explicitNumber = n.match(/(?:numero|n)\s*(\d{2})\b/);
  if (explicitNumber) number = explicitNumber[1];
  if (!number && type === 'calcado') { const standalone = n.match(/\b(1[3-9]|2\d|3\d|4[0-9])\b/); if (standalone) number = standalone[1]; }
  const tokens = n.split(' ').filter(t => t && !SEARCH_STOP.has(t) && !/^\d+(?:[.,]\d+)?$/.test(t) && !COLOR_WORDS.includes(t) && !SIZE_WORDS.includes(t));
  return { type, number, size, color, maxPrice: maxMatch ? Number(maxMatch[1].replace(',','.')) : 0, tokens };
}
function normalizedProduct(p) {
  const numbers = (p.numbers?.length ? p.numbers : (p.type === 'calcado' ? splitList((String(p.details||'').match(/Numerações?:\s*([^|]+)/i)||[])[1]) : [])).map(String);
  const sizes = (p.sizes?.length ? p.sizes : (p.type === 'roupa' || p.type === 'pizza' ? splitList((String(p.details||'').match(/Tamanhos?:?\s*([^|]+)/i)||[])[1]) : [])).map(String);
  const colors = (p.colors?.length ? p.colors : splitList((String(p.details||'').match(/Cores?:\s*([^|]+)/i)||[])[1])).map(String);
  const variants = Array.isArray(p.variants) ? p.variants : [];
  return { numbers, sizes, colors, variants };
}
function availableVariants(p) { return normalizedProduct(p).variants.filter(v => Number(v.qty || 0) > 0); }
function productAvailable(p) { return p.status === 'ativo' && (p.stock !== 'detalhado' || availableVariants(p).length > 0 || !normalizedProduct(p).variants.length); }
function productMatchesStructured(p, intent) {
  const meta = normalizedProduct(p);
  if (intent.type && p.type !== intent.type) return false;
  if (intent.maxPrice && priceNumber(currentPrice(p)) > intent.maxPrice) return false;
  const wantedOption = intent.number || intent.size || '';
  const wantedColor = normalizeText(intent.color || '');
  const liveVariants = meta.variants.filter(v => Number(v.qty || 0) > 0);
  if (p.stock === 'detalhado' && liveVariants.length && (wantedOption || wantedColor)) {
    const compatible = liveVariants.some(v => {
      const optionOk = !wantedOption || normalizeText(v.option) === normalizeText(wantedOption);
      const colorOk = !wantedColor || normalizeText(v.color) === wantedColor;
      return optionOk && colorOk;
    });
    if (!compatible) return false;
  } else {
    if (intent.number && !meta.numbers.map(normalizeText).includes(normalizeText(intent.number))) return false;
    if (intent.size && !meta.sizes.map(normalizeText).includes(normalizeText(intent.size))) return false;
    if (intent.color && !meta.colors.map(normalizeText).includes(wantedColor)) return false;
  }
  return true;
}
function productSearchScore(p, query, intent) {
  const store = storeById(p.storeId);
  const haystack = normalizeText([p.name,p.brand,p.details,p.type,categoryLabel(p.type),store?.name,store?.category].filter(Boolean).join(' '));
  let score = 0;
  intent.tokens.forEach(t => { if (haystack.includes(t)) score += 12; });
  if (normalizeText(p.name).includes(normalizeText(query))) score += 30;
  if (intent.type && p.type === intent.type) score += 20;
  if (intent.number || intent.size || intent.color) score += 15;
  if (activeOfferFor(p.id)) score += 4;
  score += storePriority(store?.plan);
  return score;
}
function searchProducts(query = '', filters = {}) {
  const intent = parseSearchIntent(query);
  if (filters.category) intent.type = filters.category;
  if (filters.option) {
    const opt = String(filters.option).trim();
    if (/^\d{2}$/.test(opt)) intent.number = opt; else if (opt) intent.size = opt.toUpperCase();
  }
  if (filters.color) intent.color = normalizeText(filters.color);
  if (filters.maxPrice) intent.maxPrice = Number(String(filters.maxPrice).replace(',','.')) || 0;
  return publicProducts().filter(productAvailable).filter(p => {
    if (!productMatchesStructured(p, intent)) return false;
    const store = storeById(p.storeId);
    const haystack = normalizeText([p.name,p.brand,p.details,p.type,categoryLabel(p.type),store?.name,store?.category].filter(Boolean).join(' '));
    return !intent.tokens.length || intent.tokens.every(t => haystack.includes(t));
  }).sort((a,b) => {
    const storeA=storeById(a.storeId);
    const storeB=storeById(b.storeId);
    return compareStorePriority(storeA,storeB)
      || (productSearchScore(b,query,intent)-productSearchScore(a,query,intent))
      || String(a.name||'').localeCompare(String(b.name||''),'pt-BR');
  });
}
function searchBadges(query='', filters={}) {
  const i = parseSearchIntent(query);
  if (filters.category) i.type = filters.category;
  if (filters.option) /^\d{2}$/.test(String(filters.option).trim()) ? i.number=String(filters.option).trim() : i.size=String(filters.option).trim().toUpperCase();
  if (filters.color) i.color = filters.color;
  if (filters.maxPrice) i.maxPrice = Number(String(filters.maxPrice).replace(',','.')) || 0;
  const out=[];
  if(i.type) out.push(categoryLabel(i.type)); if(i.number) out.push(`Nº ${i.number}`); if(i.size) out.push(`Tam. ${i.size}`); if(i.color) out.push(`Cor ${i.color}`); if(i.maxPrice) out.push(`Até R$ ${i.maxPrice.toFixed(2).replace('.',',')}`);
  return out;
}
function availabilitySummary(p) {
  const meta=normalizedProduct(p); const parts=[]; const live=availableVariants(p);
  const detailed = p.stock === 'detalhado' && live.length;
  const baseOpts = p.type === 'calcado' ? meta.numbers : meta.sizes;
  const opts = [...new Set([...baseOpts,...live.map(v=>v.option).filter(Boolean)])];
  const colors = [...new Set([...meta.colors,...live.map(v=>v.color).filter(Boolean)])];
  if (opts.length && p.type === 'calcado') parts.push(`Numerações: ${opts.join(', ')}`);
  else if (opts.length) parts.push(`Tamanhos: ${opts.join(', ')}`);
  if (colors.length) parts.push(`Cores: ${colors.join(', ')}`);
  if (detailed) parts.push(`${live.reduce((s,v)=>s+Number(v.qty||0),0)} un. em estoque`);
  return parts;
}
function categoryLabel(type) { return ({ roupa:'Moda', calcado:'Calçados', pizza:'Alimentação', beleza:'Beleza', celular:'Tecnologia', outro:'Outros' })[type] || 'Outros'; }
function whatsappUrl(store, product) {
  const digits = String(store?.whatsapp || '').replace(/\D/g,'');
  if (!digits) return '';
  const phone = digits.startsWith('55') ? digits : `55${digits}`;
  const productPrice = product ? currentPrice(product) : '';
  const text = product
    ? `Olá! Vim pelo Achou, Comprou 👋 Tenho interesse no produto *${product.name}*${productPrice ? ` por ${money(productPrice)}` : ''}. Ainda está disponível?`
    : `Olá! Vim pelo Achou, Comprou 👋 Quero saber mais sobre os produtos da sua loja.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

const data = {
  offers: [
    { type: 'shoe', name: 'Tênis Infantil', price: 'R$ 79,90', old: 'R$ 99,90', discount: '-20%', store: 'Maranhão Calçados', dist: '0,8 km' },
    { type: 'appliance', name: 'Air Fryer 4,2L', price: 'R$ 339,90', old: 'R$ 399,90', discount: '-15%', store: 'Eletro Center', dist: '1,2 km' },
    { type: 'pizza', name: 'Pizza Grande', price: 'R$ 29,90', old: 'R$ 39,90', discount: '-25%', store: 'Pizzaria do Cheff', dist: '1,5 km' }
  ],
  shops: ['Maranhão Calçados', 'Bella Store', 'Tech Cell', 'Casa & Cia', 'Pizzaria do Cheff']
};

const icons = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  heart: '<path d="M20.8 5.7a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.3a5.4 5.4 0 1 0-7.6 7.6L12 22l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  sliders: '<path d="M4 6h10M18 6h2M10 12h10M4 12h2M4 18h6M14 18h6"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="12" cy="18" r="2"/>',
  shirt: '<path d="M8 4 4 6l2 5 2-1v10h8V10l2 1 2-5-4-2c-.8 1.4-2.2 2-4 2S8.8 5.4 8 4Z"/>',
  food: '<path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 3v18M16 3c3 2 3 7 0 9"/>',
  beauty: '<path d="M9 3h6v5H9zM8 8h8l1 13H7L8 8Z"/><path d="M10 3V1h4v2"/>',
  health: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z"/><path d="M12 10v5M9.5 12.5h5"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 5h4M11 19h2"/>',
  car: '<path d="m5 11 2-5h10l2 5"/><path d="M4 11h16v7H4z"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/>',
  tools: '<path d="m14 6 4-4 4 4-4 4"/><path d="m2 22 9-9"/><path d="M4 4l16 16"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  store: '<path d="M4 10h16v11H4z"/><path d="M3 10 5 4h14l2 6"/><path d="M8 21v-6h8v6"/>',
  bag: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  star: '<path d="m12 2.5 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.1l6.2-.9L12 2.5Z"/>',
  flame: '<path d="M12 22c4 0 7-3 7-7 0-3-1.5-5.7-4.5-8.5.2 2-1 3.3-2.3 4.2.1-3.1-1.8-5.6-4.2-8.2.2 4-3 6.2-3 10.5 0 5 3 9 7 9Z"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1A1.7 1.7 0 0 0 4.3 7l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  package: '<path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="M4 7v10l8 4 8-4V7"/><path d="M12 11v10"/>',
  card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  chat: '<path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 21 12Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrowLeft: '<path d="m15 18-6-6 6-6"/>',
  arrowRight: '<path d="m9 18 6-6-6-6"/>',
  share: '<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>'
};

function icon(name, cls = 'ui-icon') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
}

function productVisual(type, compact = false) {
  const map = {
    shoe: `<svg viewBox="0 0 160 100" aria-hidden="true"><path d="M17 65c24 5 42-4 59-30l20 16c9 8 21 13 35 16 8 2 12 7 12 14 0 6-6 10-14 10H35c-14 0-22-6-22-15 0-4 1-8 4-11Z" fill="#111"/><path d="M38 82h93" stroke="#f4c400" stroke-width="6" stroke-linecap="round"/><path d="M69 45 83 58M78 39l14 14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
    appliance: `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="26" y="14" width="68" height="92" rx="20" fill="#151515"/><circle cx="60" cy="40" r="9" fill="#f4c400"/><rect x="38" y="58" width="44" height="34" rx="10" fill="#2b2b2b"/><path d="M48 69h24" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
    pizza: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="44" fill="#f0b44c"/><circle cx="60" cy="60" r="35" fill="#d93d2d"/><circle cx="45" cy="42" r="6" fill="#77271f"/><circle cx="73" cy="46" r="6" fill="#77271f"/><circle cx="78" cy="73" r="6" fill="#77271f"/><circle cx="46" cy="76" r="6" fill="#77271f"/><path d="M60 25v70M25 60h70M35 35l50 50M85 35 35 85" stroke="#f6d26a" stroke-width="3"/></svg>`,
    shirt: `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M42 24 22 34l9 22 11-5v48h36V51l11 5 9-22-20-10c-5 8-11 12-18 12S47 32 42 24Z" fill="#202020"/><path d="M48 29c3 6 7 9 12 9s9-3 12-9" fill="none" stroke="#f4c400" stroke-width="4"/></svg>`,
    bag: `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M28 42h64l-5 57H33l-5-57Z" fill="#202020"/><path d="M45 43V35a15 15 0 0 1 30 0v8" fill="none" stroke="#f4c400" stroke-width="5"/></svg>`
  };
  return `<div class="product-art ${compact ? 'compact' : ''}">${map[type] || map.bag}</div>`;
}


function productMedia(product, compact = false) {
  if (product?.imageData) return `<div class="product-photo ${compact ? 'compact' : ''}"><img src="${product.imageData}" alt="${esc(product.name || 'Produto')}"></div>`;
  return productVisual(product?.art || 'bag', compact);
}
function storeLogoMedia(store, cls = '') {
  if (store?.logoData) return `<img class="store-logo-image ${cls}" src="${store.logoData}" alt="Logo ${esc(store.name || 'Loja')}">`;
  return icon('store', cls || 'ui-icon');
}
function fileToDataUrl(file, maxW = 1000, maxH = 1000, quality = .76) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (!file.type.startsWith('image/')) return reject(new Error('Escolha uma imagem válida.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
      img.onload = () => {
        let w = img.width, h = img.height;
        const scale = Math.min(1, maxW / w, maxH / h);
        w = Math.max(1, Math.round(w * scale)); h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
function bindImagePicker(inputId, previewId, options = {}) {
  const input = document.getElementById(inputId), preview = document.getElementById(previewId);
  if (!input || !preview) return { get: () => '' };
  let value = options.initial || '';
  const render = () => { preview.innerHTML = value ? `<img src="${value}" alt="Prévia da imagem">` : `<span>${icon('image')}</span><b>${options.emptyTitle || 'Adicionar imagem'}</b><small>${options.emptyText || 'JPG ou PNG'}</small>`; };
  render();
  preview.onclick = () => input.click();
  input.onchange = async () => {
    const file = input.files?.[0]; if (!file) return;
    preview.classList.add('loading');
    try { value = await fileToDataUrl(file, options.maxW || 1000, options.maxH || 1000, options.quality || .76); render(); }
    catch (err) { alert(err.message || 'Não foi possível processar a imagem.'); }
    preview.classList.remove('loading');
  };
  return { get: () => value, set: v => { value = v || ''; render(); } };
}

function bindMultiImagePicker(inputId, previewId, options = {}) {
  const input=document.getElementById(inputId), preview=document.getElementById(previewId);
  if(!input||!preview)return {get:()=>[],set:()=>{}};
  const max=Math.max(1,Number(options.max||8));
  let values=(Array.isArray(options.initial)?options.initial:[]).filter(Boolean).slice(0,max);
  const render=()=>{
    preview.innerHTML=`
      <div class="multi-image-grid">
        ${values.map((src,i)=>`<div class="multi-image-item ${i===0?'primary':''}"><img src="${src}" alt="Foto ${i+1}"><button type="button" data-remove-image="${i}" aria-label="Remover foto">×</button>${i===0?'<span>PRINCIPAL</span>':''}</div>`).join('')}
        ${values.length<max?`<button type="button" class="multi-image-add" id="${previewId}Add">${icon('plus')}<b>Adicionar fotos</b><small>${values.length}/${max}</small></button>`:''}
      </div>`;
    preview.querySelectorAll('[data-remove-image]').forEach(btn=>btn.onclick=e=>{
      e.stopPropagation();
      values.splice(Number(btn.dataset.removeImage),1);
      render();
    });
    const add=preview.querySelector('.multi-image-add');
    if(add)add.onclick=()=>input.click();
  };
  input.multiple=true;
  input.onchange=async()=>{
    const files=[...(input.files||[])].slice(0,Math.max(0,max-values.length));
    if(!files.length)return;
    preview.classList.add('loading');
    try{
      for(const file of files){
        values.push(await fileToDataUrl(file,options.maxW||1200,options.maxH||1200,options.quality||.78));
      }
      values=values.slice(0,max);
      render();
    }catch(err){
      alert(err.message||'Não foi possível processar uma das imagens.');
    }
    input.value='';
    preview.classList.remove('loading');
  };
  render();
  return {
    get:()=>values.slice(),
    set:v=>{values=(Array.isArray(v)?v:[]).filter(Boolean).slice(0,max);render();}
  };
}

function nav(active = 'home') {
  return `<nav class="bottom-nav marketplace-bottom-nav">
    <button class="nav-item ${active === 'home' ? 'active' : ''}" data-go="home">${icon('home')}<span>Início</span></button>
    <button class="nav-item ${active === 'search' ? 'active' : ''}" data-go="search">${icon('search')}<span>Buscar</span></button>
    <button class="nav-item ${active === 'categories' ? 'active' : ''}" data-go="categories">${icon('grid')}<span>Categorias</span></button>
    <button class="nav-item ${active === 'fav' ? 'active' : ''}" data-go="fav">${icon('heart')}<span>Favoritos</span></button>
    <button class="nav-item ${active === 'profile' ? 'active' : ''}" data-go="profile">${icon('user')}<span>Perfil</span></button>
  </nav>`;
}

function logo() {
  return `<img src="assets/logo-achou-comprou.png" alt="Achou, Comprou" class="mini-logo">`;
}

function splash() {
  app.innerHTML = `<main class="app-shell screen splash-minimal" id="splashMinimal" role="button" tabindex="0" aria-label="Abrir Achou, Comprou">
    <section class="splash-minimal-center">
      <img src="assets/logo-achou-comprou.png" class="splash-minimal-logo" alt="Achou, Comprou">
      <p>Tudo que você procura, perto de você.</p>
      <div class="splash-progress" aria-hidden="true"><span></span></div>
    </section>
    <small class="splash-city">Grajaú · Maranhão</small>
  </main>`;
  const go = () => home();
  document.getElementById('splashMinimal')?.addEventListener('click', go, { once:true });
  document.getElementById('splashMinimal')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') go();
  }, { once:true });
  clearTimeout(window.__achouSplashTimer);
  window.__achouSplashTimer = setTimeout(go, 1250);
}

function home() {
  const premiumBanners = publicPremiumBanners();
  const defaultBanner = {
    id:'default-banner',
    storeId:null,
    title:'Ofertas da sua cidade',
    message:'Produtos e ofertas das lojas da cidade em um só lugar.',
    imageData:'',
    videoData:'./Creating_smooth_advertising_bann…_1080p_20260926152920.mp4',
    active:true,
    isPlatform:true
  };
  const bannerItems = [defaultBanner, ...premiumBanners];
  const products = rankedPublicProducts();
  const shops = approvedStores().filter(m=>m.plan!=='gratis');
  const client = currentClient();
  const unreadNotifications = (db.notifications || []).filter(n => !n.read).length;
  const quickSearches = ['Churrasco','Tênis','Celular','Pizzaria','Farmácia'];
  const cats = [
    ['shirt','Moda','moda'],
    ['bag','Calçados','calcado'],
    ['food','Alimentação','alimentacao'],
    ['beauty','Beleza','beleza'],
    ['health','Saúde','saude'],
    ['home','Casa','casa'],
    ['grid','Mais','']
  ];

  app.innerHTML = `<main class="app-shell home-professional home-marketplace">
    <header class="topbar home-topbar marketplace-topbar">
      <div class="brand-row home-brand-row">
        ${logo()}
        <div class="home-head-actions">
          <button class="location-button">${icon('pin')}<span>Grajaú - MA</span><span class="chevron">⌄</span></button>
          <button class="round-action" data-go="notifications" aria-label="Notificações">${icon('bell')}${unreadNotifications ? '<span class="notification-dot" aria-hidden="true"></span>' : ''}</button>
          <button class="round-action home-profile-action ${client?.avatar ? 'has-photo' : ''}" data-go="profile" aria-label="Meu perfil">${client?.avatar ? `<img src="${esc(client.avatar)}" alt="Foto de perfil">` : icon('user')}</button>
        </div>
      </div>

      <div class="search home-search marketplace-search">
        <span class="search-leading">${icon('search')}</span>
        <input id="q" placeholder="O que você está procurando?">
        <button id="searchBtn" aria-label="Buscar">${icon('sliders')}</button>
      </div>

      <div class="market-quick-row">
        <b>BUSCAS RÁPIDAS</b>
        <div class="market-quick-scroll">${quickSearches.map(term=>`<button data-search-term="${esc(term)}">${esc(term)}</button>`).join('')}</div>
      </div>

      <div class="market-category-row">
        ${cats.map(([ico,label,term])=>term
          ? `<button data-search-term="${term}"><i>${icon(ico)}</i><span>${label}</span></button>`
          : `<button data-go="categories"><i>${icon(ico)}</i><span>${label}</span></button>`
        ).join('')}
      </div>
    </header>

    <section class="content home-content marketplace-content">
      <section class="banner-carousel market-banner-carousel" id="homeBannerCarousel" aria-label="Destaques da cidade">
        <div class="banner-carousel-track" id="homeBannerTrack">
          ${bannerItems.map((banner,index)=>{
            const bannerStore=storeById(banner.storeId);
            if(banner.videoData){
              return `<article class="banner banner-pro banner-slide market-hero-banner market-video-banner" data-banner-index="${index}">
                <video class="market-home-banner-video" autoplay muted loop playsinline preload="metadata" aria-label="Banner Achou, Comprou">
                  <source src="${esc(banner.videoData)}" type="video/mp4">
                </video>
                <button class="market-video-hit" type="button" data-search-term="" aria-label="Ver produtos e ofertas"></button>
              </article>`;
            }
            if(banner.imageData){
              return `<article class="banner banner-pro banner-slide market-hero-banner market-art-banner" data-banner-index="${index}">
                <img class="market-art-banner-image" src="${esc(banner.imageData)}" alt="Banner ${esc(bannerStore?.name||'Loja em destaque')}">
                ${bannerStore ? `<button class="market-art-banner-hit" type="button" data-store-id="${bannerStore.id}" aria-label="Abrir ${esc(bannerStore.name)}"></button>` : ''}
              </article>`;
            }
            const bannerVisual=bannerStore?.logoData
              ? `<div class="banner-media logo"><img src="${esc(bannerStore.logoData)}" alt="Logo ${esc(bannerStore.name)}"></div>`
              : '<div class="market-default-mark">AC</div>';
            return `<article class="banner banner-pro banner-slide market-hero-banner" data-banner-index="${index}">
              <div class="banner-copy">
                <span class="banner-label">${bannerStore ? 'LOJA EM DESTAQUE' : 'COMÉRCIO LOCAL'}</span>
                <small>${bannerStore ? esc(bannerStore.name) : 'Achou, Comprou'}</small>
                <h2>${esc(banner.title||'Ofertas da sua cidade')}</h2>
                <p>${esc(banner.message||'Produtos e ofertas das lojas da cidade em um só lugar.')}</p>
                <div class="banner-footer">
                  <span>${icon('pin')} Grajaú - MA</span>
                  ${bannerStore
                    ? `<button class="banner-cta" type="button" data-store-id="${bannerStore.id}">Ver oferta ${icon('arrowRight')}</button>`
                    : `<button class="banner-cta" type="button" data-search-term="">Ver ofertas ${icon('arrowRight')}</button>`
                  }
                </div>
              </div>
              ${bannerVisual}
            </article>`;
          }).join('')}
        </div>
        ${bannerItems.length>1?`<div class="banner-carousel-dots">${bannerItems.map((_,i)=>`<button type="button" class="${i===0?'active':''}" data-banner-dot="${i}" aria-label="Mostrar banner ${i+1}"></button>`).join('')}</div>`:''}
      </section>

      <div class="market-section-title stores-first">
        <div class="market-section-icon">${icon('store')}</div>
        <div><h3>Lojas em destaque</h3><p>Comércio da sua cidade</p></div>
        <button data-search-term="">Ver todas ${icon('arrowRight')}</button>
      </div>

      <div class="market-store-strip">
        ${shops.length ? shops.slice(0,8).map(m=>`
          <button class="market-store-tile" data-store-id="${m.id}">
            <span class="market-store-logo ${m.logoData?'has-logo':''}">${m.logoData ? `<img src="${esc(m.logoData)}" alt="Logo ${esc(m.name)}">` : esc((m.name||'L').slice(0,2).toUpperCase())}</span>
            <b>${esc(m.name)}</b>
            <small>${esc(m.category||'Comércio local')}</small>
            <em>${icon('star')} ${esc(m.rating||'Novo')}</em>
          </button>
        `).join('') : '<div class="market-empty-dark">Nenhuma loja em destaque ainda.</div>'}
      </div>

      <div class="market-section-title offers-title all-products-title">
        <div class="market-section-icon">${icon('package')}</div>
        <div><h3>Todos os produtos</h3><p>Ordenados por plano, pontuação e cliques no WhatsApp</p></div>
        <button data-search-term="">Ver todos ${icon('arrowRight')}</button>
      </div>

      <div class="market-offer-grid market-product-grid">
        ${products.length ? products.map(({product:p,offer:o,store:m})=>{
          const discount=discountFor(p);
          const favorite=isFavorite(p.id);
          const price=currentPrice(p);
          const old=originalPrice(p);
          const hasDiscount=priceNumber(price)<priceNumber(old);
          return `<article class="market-offer-card market-product-card" data-product-id="${p.id}">
            <div class="market-offer-media">
              ${productMedia(p,true)}
              ${discount ? `<span class="market-discount">${esc(discount.replace('-',''))} OFF</span>` : ''}
              <button class="market-favorite ${favorite?'active':''}" type="button" data-home-fav="${p.id}" aria-label="Favoritar">${icon('heart')}</button>
            </div>
            <div class="market-offer-body">
              <div class="market-offer-title">${esc(p.name)}</div>
              <div class="market-price-row"><strong>${money(price)}</strong>${hasDiscount ? `<span>${money(old)}</span>` : ''}</div>
              <span class="market-available">${icon('check')} ${o?'Oferta ativa':'Disponível'}</span>
              <div class="market-offer-footer">
                <div class="market-offer-store"><b>${esc(m.name)}</b><small>${esc(m.category||'Comércio local')} · ${esc(m.dist||'Grajaú')}</small></div>
                <button class="market-whatsapp" type="button" data-home-wa="${p.id}" aria-label="Falar no WhatsApp">${icon('chat')}</button>
                <span class="market-go">${icon('arrowRight')}</span>
              </div>
            </div>
          </article>`;
        }).join('') : '<div class="market-empty-products">Nenhum produto ativo no momento.</div>'}
      </div>
    </section>

    ${nav('home')}
  </main>`;

  bind();

  document.getElementById('searchBtn').onclick = () => search(document.getElementById('q').value);
  document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') search(e.target.value); });

  document.querySelectorAll('[data-home-wa]').forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const p=db.products.find(x=>x.id===btn.dataset.homeWa);
    const m=p?storeById(p.storeId):null;
    const url=p&&m?whatsappUrl(m,p):'';
    if(!url)return;
    if(window.ACCloud?.enabled) window.ACCloud.trackEvent('clique_whatsapp',{storeId:m.id,productId:p.id,metadata:{source:'home',product_name:p.name}}).catch(()=>{});
    window.open(url,'_blank');
  });

  document.querySelectorAll('[data-home-fav]').forEach(btn=>btn.onclick=async e=>{
    e.stopPropagation();
    const productId=btn.dataset.homeFav;
    if(!currentClient()){
      publicState.afterLogin={screen:'product',productId,favoriteId:productId};
      clientLogin();
      return;
    }
    const ok=await setFavorite(productId,!isFavorite(productId));
    if(ok)home();
  });

  clearInterval(window.__achouBannerTimer);
  const bannerTrack=document.getElementById('homeBannerTrack');
  const bannerCarousel=document.getElementById('homeBannerCarousel');
  const bannerDots=[...document.querySelectorAll('[data-banner-dot]')];
  let bannerIndex=0;
  let touchStartX=null;
  const showBanner=(next)=>{
    if(!bannerTrack)return;
    const total=bannerItems.length;
    bannerIndex=(next+total)%total;
    bannerTrack.style.transform=`translateX(-${bannerIndex*100}%)`;
    bannerDots.forEach((dot,i)=>dot.classList.toggle('active',i===bannerIndex));
  };
  const restartBannerTimer=()=>{
    clearInterval(window.__achouBannerTimer);
    if(bannerItems.length<2)return;
    window.__achouBannerTimer=setInterval(()=>{
      if(!document.body.contains(bannerTrack)){clearInterval(window.__achouBannerTimer);return;}
      showBanner(bannerIndex+1);
    },4800);
  };
  bannerDots.forEach(dot=>dot.onclick=()=>{showBanner(Number(dot.dataset.bannerDot));restartBannerTimer();});
  bannerCarousel?.addEventListener('touchstart',e=>{touchStartX=e.touches?.[0]?.clientX ?? null;},{passive:true});
  bannerCarousel?.addEventListener('touchend',e=>{
    if(touchStartX===null)return;
    const endX=e.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta=endX-touchStartX;
    touchStartX=null;
    if(Math.abs(delta)>42){showBanner(bannerIndex+(delta<0?1:-1));restartBannerTimer();}
  },{passive:true});
  restartBannerTimer();
}

function search(q = '') {
  publicState.query = q ?? publicState.query ?? '';
  const cleanQuery = String(publicState.query || '').trim();
  if (cleanQuery) {
    db.recentSearches = [cleanQuery, ...(db.recentSearches || []).filter(x => normalizeText(x) !== normalizeText(cleanQuery))].slice(0, 8);
    saveDb();
    if(window.ACCloud?.enabled) window.ACCloud.trackEvent('busca',{search:cleanQuery}).catch(()=>{});
  }
  const results = searchProducts(publicState.query, publicState.filters);
  const storeMatches = approvedStores().filter(m => !publicState.query || normalizeText([m.name,m.category,m.description].join(' ')).includes(normalizeText(publicState.query)));
  const badges = searchBadges(publicState.query, publicState.filters);
  app.innerHTML = `<main class="app-shell">
    <header class="topbar search-page-top"><div class="search"><button data-go="home" aria-label="Voltar">${icon('arrowLeft')}</button><input id="searchQuery" value="${esc(publicState.query)}" placeholder="O que você está procurando?"><button id="repeatSearch" aria-label="Buscar">${icon('search')}</button></div></header>
    <section class="content">
      <div class="search-toolbar"><div><b>${results.length} produto${results.length === 1 ? '' : 's'} compatível${results.length === 1 ? '' : 'is'}</b><span>A busca considera produto, tamanho, numeração, cor, preço e disponibilidade.</span></div><button class="filter-toggle" id="toggleFilters">${icon('sliders')} Filtros</button></div>
      ${badges.length ? `<div class="smart-badges">${badges.map(x=>`<span>${esc(x)}</span>`).join('')}</div>` : ''}
      <div class="filter-panel hidden" id="filterPanel">
        <label>Categoria<select id="filterCategory"><option value="">Todas</option><option value="roupa">Moda</option><option value="calcado">Calçados</option><option value="pizza">Alimentação</option><option value="beleza">Beleza</option><option value="celular">Tecnologia</option></select></label>
        <label>Tamanho / nº<input id="filterOption" placeholder="Ex.: M ou 28" value="${esc(publicState.filters.option)}"></label>
        <label>Cor<input id="filterColor" placeholder="Ex.: Preto" value="${esc(publicState.filters.color)}"></label>
        <label>Preço máximo<input id="filterMax" inputmode="decimal" placeholder="Ex.: 100" value="${esc(publicState.filters.maxPrice)}"></label>
        <div class="filter-actions"><button class="btn btn-secondary" id="clearFilters" type="button">Limpar</button><button class="btn btn-yellow" id="applyFilters" type="button">Aplicar filtros</button></div>
      </div>
      <div class="chips"><button class="chip active">Todos (${results.length + storeMatches.length})</button><button class="chip">Produtos (${results.length})</button><button class="chip">Lojas (${storeMatches.length})</button></div>
      <div class="list search-product-grid">${results.length ? results.map(p => { const m=storeById(p.storeId); const price=currentPrice(p); const old=originalPrice(p); const avail=availabilitySummary(p); return `<article class="result search-result-card"><div class="thumb">${productMedia(p, true)}</div><div class="search-result-info"><span class="tag">Disponível</span><h4>${esc(p.name)}</h4><div class="price">${money(price)}</div>${price !== old ? `<div class="old">${money(old)}</div>` : ''}${avail.length ? `<div class="availability-line">${avail.slice(0,2).map(esc).join(' · ')}</div>` : ''}<div class="store">${esc(m?.name || 'Loja')}</div><div class="dist">${icon('pin')} ${esc(m?.dist || 'Grajaú')} de você</div><button class="btn btn-yellow" data-product-id="${p.id}">Ver produto</button></div></article>`; }).join('') : '<div class="empty"><b>Nenhum produto compatível.</b><span>Tente retirar um filtro ou pesquisar de outra forma.</span></div>'}</div>
      ${storeMatches.length ? `<div class="section-title compact-title"><h3>Lojas encontradas</h3></div><div class="shops">${storeMatches.map(m => `<button class="shop" data-store-id="${m.id}"><div class="shop-logo">${esc(m.name.slice(0,1).toUpperCase())}</div><b>${esc(m.name)}</b><small>${esc(m.category)}</small></button>`).join('')}</div>` : ''}
    </section>
    ${nav('search')}
  </main>`;
  bind();
  const input=document.getElementById('searchQuery');
  const cat=document.getElementById('filterCategory'); if(cat) cat.value=publicState.filters.category || '';
  document.getElementById('repeatSearch').onclick=()=>search(input.value);
  input.addEventListener('keydown',e=>{if(e.key==='Enter') search(e.target.value);});
  document.getElementById('toggleFilters').onclick=()=>document.getElementById('filterPanel').classList.toggle('hidden');
  document.getElementById('applyFilters').onclick=()=>{ publicState.filters={category:cat.value,option:document.getElementById('filterOption').value.trim(),color:document.getElementById('filterColor').value.trim(),maxPrice:document.getElementById('filterMax').value.trim()}; search(input.value); };
  document.getElementById('clearFilters').onclick=()=>{ publicState.filters={category:'',option:'',color:'',maxPrice:''}; search(input.value); };
}

function product(productId = publicState.productId) {
  const p = db.products.find(x => x.id === productId) || publicProducts()[0];
  if (!p) return search(publicState.query);
  const m = storeById(p.storeId);
  if (!m || m.status !== 'aprovada') return search(publicState.query);
  publicState.productId = p.id; publicState.storeId = m.id;
  const fav = isFavorite(p.id);
  const price = currentPrice(p), old = originalPrice(p);
  const discount = discountFor(p);
  const details = String(p.details || '').split('|').map(x=>x.trim()).filter(Boolean);
  const availability = availabilitySummary(p);
  const meta = normalizedProduct(p);
  const liveOptions = availableVariants(p).map(v=>v.option).filter(Boolean);
  const productOptions = [...new Set([...(p.type==='calcado'?meta.numbers:meta.sizes),...liveOptions])];
  const optionTitle = p.type==='calcado' ? 'Numerações disponíveis' : 'Tamanhos disponíveis';
  const photos = [...new Set((Array.isArray(p.images)&&p.images.length?p.images:(p.imageData?[p.imageData]:[])).filter(Boolean))];
  const storeLogo = m.logoData
    ? `<img src="${esc(m.logoData)}" alt="Logo ${esc(m.name)}">`
    : icon('store');

  app.innerHTML = `<main class="app-shell product-page product-page-pro">
    <div class="product-topbar">
      <button class="product-back" id="productBack" aria-label="Voltar">${icon('arrowLeft')}</button>
      <div><span>ACHOU, COMPROU</span><b>Detalhes do produto</b></div>
      <div class="product-top-actions">
        <button id="headFav" class="${fav?'active':''}" aria-label="Favoritar">${icon('heart')}</button>
        <button id="productShare" aria-label="Compartilhar">${icon('share')}</button>
      </div>
    </div>

    <section class="product-detail-shell">
      <div class="product-gallery-card">
        ${discount ? `<span class="product-discount-badge">${discount}</span>` : ''}
        ${photos.length ? `<div class="product-gallery-layout ${photos.length>1?'has-thumbs':''}">
          ${photos.length>1?`<div class="product-gallery-thumbs">${photos.map((src,i)=>`<button type="button" class="${i===0?'active':''}" data-product-photo="${i}"><img src="${esc(src)}" alt="Foto ${i+1} de ${esc(p.name)}"></button>`).join('')}</div>`:''}
          <div class="hero-product product-hero-pro product-gallery-main"><div class="product-photo"><img id="productMainPhoto" src="${esc(photos[0])}" alt="${esc(p.name)}"></div></div>
        </div>` : `<div class="hero-product product-hero-pro">${productMedia(p)}</div>`}
      </div>

      <div class="product-main-card">
        <div class="product-title-block">
          <span class="product-category-chip">${categoryLabel(p.type)}</span>
          <h1>${esc(p.name)}</h1>
          ${p.brand ? `<span class="product-brand-line">Marca: <b>${esc(p.brand)}</b></span>` : ''}
        </div>

        <div class="product-price-block">
          ${price !== old ? `<span class="product-old-price">De ${money(old)}</span>` : ''}
          <div class="product-price-line"><strong>${money(price)}</strong>${discount ? `<span>${discount} OFF</span>` : ''}</div>
          <small>Consulte condições e disponibilidade diretamente com a loja.</small>
        </div>

        <button class="product-store-card" data-store-id="${m.id}">
          <span class="product-store-logo">${storeLogo}</span>
          <span class="product-store-copy">
            <small>VENDIDO POR</small>
            <b>${esc(m.name)}</b>
            <em>${icon('star')} ${esc(m.rating || 'Novo')} <i>•</i> ${icon('pin')} ${esc(m.dist || 'Grajaú')}</em>
          </span>
          ${icon('arrowRight','product-store-arrow')}
        </button>

        <div class="product-info-section">
          <div class="product-section-head"><span>${icon('check')}</span><div><small>DISPONIBILIDADE</small><h3>Pronto para consultar</h3></div></div>
          <span class="product-stock-badge">Disponível</span>
          ${productOptions.length && ['roupa','calcado','pizza'].includes(p.type) ? `<div class="client-option-group"><b>${optionTitle}</b><div class="client-option-chips">${productOptions.map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>` : ''}
          ${availability.length ? `<div class="product-option-list">${availability.filter(x=>!x.startsWith('Tamanhos:')&&!x.startsWith('Numerações:')).map(x=>`<span>${esc(x)}</span>`).join('')}</div>` : ''}
        </div>

        <div class="product-info-section">
          <div class="product-section-head"><span>${icon('package')}</span><div><small>INFORMAÇÕES</small><h3>Detalhes do produto</h3></div></div>
          <div class="product-description">
            ${details.length ? details.map(d=>`<p>${esc(d)}</p>`).join('') : '<p>Consulte a loja para mais informações sobre este produto.</p>'}
          </div>
        </div>
      </div>
    </section>

    <div class="product-action-bar">
      <button class="product-favorite-action" id="favBtn">${icon('heart')} <span>${fav ? 'Favoritado' : 'Favoritar'}</span></button>
      <button class="product-whatsapp-action" id="waBtn">${icon('chat')} <span>Falar com a loja</span></button>
    </div>
  </main>`;

  bind();
  document.querySelectorAll('[data-product-photo]').forEach(btn=>btn.onclick=()=>{
    const index=Number(btn.dataset.productPhoto||0);
    const main=document.getElementById('productMainPhoto');
    if(main&&photos[index])main.src=photos[index];
    document.querySelectorAll('[data-product-photo]').forEach(x=>x.classList.toggle('active',x===btn));
  });
  document.getElementById('productBack').onclick = () => publicState.query ? search(publicState.query) : home();
  const toggleFav=async()=>{ if(!currentClient()){ publicState.afterLogin={screen:'product',productId:p.id,favoriteId:p.id}; return clientLogin(); } const ok=await setFavorite(p.id,!fav); if(ok) product(p.id); };
  document.getElementById('favBtn').onclick = toggleFav;
  document.getElementById('headFav').onclick = toggleFav;
  document.getElementById('productShare').onclick = async()=>{
    const text=`${p.name} — ${money(price)} na ${m.name} | Achou, Comprou`;
    try{
      if(navigator.share){await navigator.share({title:p.name,text});return;}
      await navigator.clipboard.writeText(text);
      alert('Informações do produto copiadas.');
    }catch(_){}
  };
  document.getElementById('waBtn').onclick = () => { const url=whatsappUrl(m,p); if (url) { if(window.ACCloud?.enabled) window.ACCloud.trackEvent('clique_whatsapp',{storeId:m.id,productId:p.id,metadata:{source:'produto',product_name:p.name}}).catch(()=>{}); window.open(url,'_blank'); } else alert('A loja ainda não cadastrou um WhatsApp válido.'); };
  if(window.ACCloud?.enabled) window.ACCloud.trackEvent('visualizacao_produto',{storeId:m.id,productId:p.id}).catch(()=>{});
}

async function store(storeId = publicState.storeId) {
  const m = storeById(storeId) || approvedStores()[0];
  if (!m || m.status !== 'aprovada') return home();
  publicState.storeId = m.id;
  const products = publicProducts().filter(p => p.storeId === m.id);
  const full = m.plan !== 'gratis';
  const client=currentClient();
  let myRating=0;
  if(client && window.ACCloud?.enabled){
    const mine=await window.ACCloud.getMyStoreRating?.(m.id);
    if(mine?.ok && mine.rating) myRating=Number(mine.rating.nota||0);
  }
  const ratingBox = client
    ? `<div class="store-rating-card"><div><span>AVALIAÇÃO</span><h3>Como foi sua experiência?</h3><p>Sua nota ajuda outros clientes e mostra o resultado da loja.</p></div><div class="store-rating-stars">${[1,2,3,4,5].map(n=>`<button class="${myRating>=n?'active':''}" data-store-rating="${n}" aria-label="${n} estrelas">${icon('star')}</button>`).join('')}</div><small id="storeRatingMsg">${myRating ? `Sua avaliação atual: ${myRating} estrela${myRating===1?'':'s'}.` : 'Toque nas estrelas para avaliar.'}</small></div>`
    : `<div class="store-rating-card compact"><div><span>AVALIAÇÃO</span><h3>Avalie esta loja</h3><p>Entre como cliente para registrar sua satisfação.</p></div><button class="btn btn-outline" data-go="clientLogin">Entrar para avaliar</button></div>`;
  app.innerHTML = `<main class="app-shell">
    <section class="store-hero ${m.coverData ? 'has-cover' : ''}" ${m.coverData ? `style="--store-cover:url('${m.coverData}')"` : ''}><button class="back" data-go="home" aria-label="Voltar">${icon('arrowLeft')}</button><div class="store-icon ${m.logoData ? 'with-logo' : ''}">${m.logoData ? `<img src="${m.logoData}" alt="Logo ${esc(m.name)}">` : icon('store')}</div><h1>${esc(m.name)}</h1><div class="rating-row">${icon('star')} ${esc(m.rating || 'Novo')} ${full ? '<span>Loja em destaque</span>' : '<span>Perfil básico</span>'}</div><div class="store-meta">${icon('pin')} ${esc(m.address || 'Grajaú - MA')} <span>•</span> ${esc(m.dist || 'Grajaú')}</div><div class="store-buttons"><button class="btn btn-green" id="storeWa">${icon('chat')} WhatsApp</button>${full && m.instagram ? '<button class="btn instagram" id="storeInstagram">Instagram</button>' : ''}<button class="btn btn-yellow" id="storeMap">${icon('pin')} Como chegar</button></div></section>
    <section class="content">${full ? `<div class="store-about"><h3>Sobre a loja</h3><p>${esc(m.description || 'Comércio local em Grajaú.')}</p>${m.hours ? `<small>Horário: ${esc(m.hours)}</small>` : ''}</div>` : ''}${ratingBox}<div class="section-title"><h3>Produtos</h3><a>${products.length} cadastrados</a></div><div class="offers">${products.length ? products.map(p => `<article class="card" data-product-id="${p.id}"><div class="product-img">${productMedia(p, true)}</div>${discountFor(p) ? `<span class="discount">${discountFor(p)}</span>` : ''}<div class="card-body"><div class="card-title">${esc(p.name)}</div><div class="price">${money(currentPrice(p))}</div>${currentPrice(p)!==originalPrice(p) ? `<div class="old">${money(originalPrice(p))}</div>` : ''}</div></article>`).join('') : '<div class="empty">A loja ainda não publicou produtos.</div>'}</div></section>
    ${nav('home')}
  </main>`;
  bind();
  document.getElementById('storeWa').onclick=()=>{ const url=whatsappUrl(m,null); if(url) { if(window.ACCloud?.enabled) window.ACCloud.trackEvent('clique_whatsapp',{storeId:m.id,metadata:{source:'loja'}}).catch(()=>{}); window.open(url,'_blank'); } else alert('A loja ainda não cadastrou um WhatsApp válido.'); };
  if(document.getElementById('storeInstagram')) document.getElementById('storeInstagram').onclick=()=>{ const handle=String(m.instagram||'').replace('@','').trim(); if(handle) window.open(`https://instagram.com/${handle}`,'_blank'); };
  document.getElementById('storeMap').onclick=()=>{ if(m.address) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.address)}`,'_blank'); };
  document.querySelectorAll('[data-store-rating]').forEach(btn=>btn.onclick=async()=>{
    const note=Number(btn.dataset.storeRating||0);
    const msg=document.getElementById('storeRatingMsg');
    if(!window.ACCloud?.enabled){if(msg)msg.textContent='Avaliação disponível no sistema online.';return;}
    if(msg)msg.textContent='Salvando sua avaliação...';
    const result=await window.ACCloud.rateStore(m.id,note);
    if(!result.ok){if(msg)msg.textContent=result.message||'Não foi possível salvar a avaliação.';return;}
    if(result.average!=null)m.rating=String(Number(result.average).toFixed(1)).replace('.',',');
    store(m.id);
  });
  if(window.ACCloud?.enabled) window.ACCloud.trackEvent('visualizacao_loja',{storeId:m.id}).catch(()=>{});
}

function favorites() {
  const client=currentClient();
  if(!client){
    app.innerHTML=`<main class="app-shell utility-page"><div class="page-head"><b>Meus favoritos</b></div><section class="utility-content"><div class="favorite-login-card"><span>${icon('heart')}</span><small>SUA LISTA</small><h1>Entre para salvar favoritos</h1><p>Guarde produtos que você gostou e encontre tudo novamente quando quiser.</p><button class="btn btn-yellow btn-block" id="favoriteLogin">Entrar ou criar conta</button><button class="btn btn-secondary btn-block" data-go="home">Continuar pesquisando</button></div></section>${nav('fav')}</main>`;
    bind(); document.getElementById('favoriteLogin').onclick=()=>{publicState.afterLogin={screen:'favorites'};clientLogin();}; return;
  }
  const favs=new Set(client.favorites||[]);
  const items = publicProducts().filter(p => favs.has(p.id));
  app.innerHTML = `<main class="app-shell"><div class="page-head"><b>Meus favoritos</b></div><section class="content"><div class="list">${items.length ? items.map(p => { const m=storeById(p.storeId); return `<article class="result"><div class="thumb">${productMedia(p, true)}</div><div><h4>${esc(p.name)}</h4><div class="price">${money(currentPrice(p))}</div><div class="store">${esc(m?.name || 'Loja')}</div><button class="btn btn-yellow" data-product-id="${p.id}">Abrir produto</button></div></article>`; }).join('') : '<div class="professional-empty favorite-empty"><span>'+icon('heart')+'</span><h3>Nenhum favorito ainda</h3><p>Toque no coração de um produto para guardar aqui.</p><button class="btn btn-yellow" data-go="home">Explorar produtos</button></div>'}</div></section>${nav('fav')}</main>`;
  bind();
}

function profile() {
  const client = currentClient();
  app.innerHTML = `<main class="app-shell profile-page">
    ${client ? `<div class="profile-head"><div class="avatar ${client.avatar ? 'with-photo' : ''}">${client.avatar ? `<img src="${esc(client.avatar)}" alt="Foto de ${esc(client.name)}">` : icon('user')}</div><div><span class="profile-kicker">Conta do cliente</span><h2>${esc(client.name)}</h2><p>${esc(client.email)}</p><button class="profile-edit-link" data-go="clientEditProfile">Editar perfil</button></div></div>` : `<div class="account-access-card"><div class="account-access-icon">${icon('user')}</div><div><span class="profile-kicker">Sua conta</span><h2>Entre no Achou, Comprou</h2><p>Salve favoritos e mantenha suas preferências em um só lugar.</p></div><button class="btn btn-yellow btn-block" data-go="clientLogin">Entrar ou criar conta</button></div>`}
    <div class="menu-list"><button data-go="fav"><span>${icon('heart')} Meus favoritos</span><b>›</b></button><button data-go="recentSearches"><span>${icon('search')} Minhas buscas</span><b>›</b></button><button data-go="notifications"><span>${icon('bell')} Notificações</span><b>›</b></button><button data-go="clientSettings"><span>${icon('settings')} Configurações</span><b>›</b></button></div>
    ${client ? `<button class="btn btn-outline btn-block client-logout" id="clientLogout">Sair da minha conta</button>` : ''}
    <section class="merchant-gateway"><div class="merchant-gateway-mark">${icon('store')}</div><div class="merchant-gateway-copy"><span>Para comerciantes</span><h3>Venda e apareça para quem está procurando.</h3><p>Cadastre sua loja, publique produtos e acompanhe seu desempenho.</p></div><button class="btn btn-yellow btn-block" data-go="merchantLogin">Acessar área do lojista</button><button class="text-link-btn" data-go="plansPreview">Conhecer os planos para lojas</button></section>
    ${nav('profile')}
  </main>`;
  bind();
  if (document.getElementById('clientLogout')) document.getElementById('clientLogout').onclick = async () => { if(window.ACCloud?.enabled) await window.ACCloud.signOut(); db.session.clientId = null; saveDb(); profile(); };
}

function categories() {
  const defs=[
    ['shirt','Moda','moda','Roupas, vestidos, blusas e acessórios'],
    ['bag','Calçados','calcado','Tênis, sandálias, chinelos e mais'],
    ['food','Alimentação','alimentacao','Pizzas, lanches, refeições e bebidas'],
    ['beauty','Beleza','beleza','Perfumes, cosméticos e cuidados pessoais'],
    ['health','Saúde','saude','Farmácia, cuidados e bem-estar'],
    ['home','Casa','casa','Móveis, utilidades e decoração'],
    ['phone','Tecnologia','tecnologia','Celulares, acessórios e eletrônicos'],
    ['car','Automotivo','automotivo','Peças, acessórios e serviços automotivos'],
    ['tools','Serviços','servicos','Profissionais e serviços da cidade'],
    ['grid','Outros','outros','Tudo que não se encaixa nas categorias acima']
  ];
  const counts={}; publicProducts().forEach(p=>{const k=categoryLabel(p.type);counts[k]=(counts[k]||0)+1;});
  app.innerHTML=`<main class="app-shell utility-page categories-page"><div class="page-head"><button class="back" data-go="home" aria-label="Voltar">${icon('arrowLeft')}</button><b>Todas as categorias</b></div><section class="utility-content"><div class="utility-hero"><span>${icon('grid')}</span><div><small>EXPLORAR</small><h1>Encontre por categoria</h1><p>Veja produtos e lojas da cidade organizados por tipo.</p></div></div><div class="category-directory">${defs.map(([ico,label,term,desc])=>`<button data-category-search="${term}"><span class="category-directory-icon">${icon(ico)}</span><span class="category-directory-copy"><b>${label}</b><small>${desc}</small></span><span class="category-directory-count">${counts[label]||0}</span>${icon('arrowRight','category-directory-arrow')}</button>`).join('')}</div></section>${nav('search')}</main>`;
  bind(); document.querySelectorAll('[data-category-search]').forEach(btn=>btn.onclick=()=>search(btn.dataset.categorySearch));
}

function clientEditProfile(){
  const c=currentClient(); if(!c) return clientLogin();
  app.innerHTML=`<main class="app-shell form-page client-edit-page"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Editar perfil</b></div><form class="form-card client-edit-card" id="clientEditForm"><div class="form-intro"><span class="section-icon">${icon('user')}</span><div><h2>Seus dados</h2><p>Mantenha suas informações atualizadas.</p></div></div><div class="client-avatar-field"><input class="media-file-input" id="clientAvatarFile" type="file" accept="image/jpeg,image/png,image/webp"><button class="media-picker square client-avatar-picker" type="button" id="clientAvatarPreview"></button><div class="client-avatar-copy"><b>Foto do perfil</b><span>Opcional. Ela aparece no seu perfil e no topo da página inicial.</span>${c.avatar?'<button type="button" class="text-link-btn client-avatar-remove" id="removeClientAvatar">Remover foto</button>':''}</div></div><label>Nome completo<input id="editClientName" required value="${esc(c.name||'')}"></label><label>E-mail<input id="editClientEmail" type="email" required value="${esc(c.email||'')}"></label><label>WhatsApp<input id="editClientPhone" inputmode="tel" value="${esc(c.phone||'')}" placeholder="(99) 99999-9999"></label><label>Cidade<input id="editClientCity" value="${esc(c.city||'Grajaú - MA')}" placeholder="Grajaú - MA"></label><button class="btn btn-yellow btn-block" type="submit">Salvar alterações</button><div id="clientEditMsg"></div></form></main>`;
  bind();
  const avatarPicker=bindImagePicker('clientAvatarFile','clientAvatarPreview',{maxW:640,maxH:640,quality:.82,emptyTitle:'Adicionar foto',emptyText:'JPG, PNG ou WebP'});
  avatarPicker.set(c.avatar||'');
  document.getElementById('removeClientAvatar')?.addEventListener('click',()=>avatarPicker.set(''));
  document.getElementById('clientEditForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('clientEditMsg');
    const email=document.getElementById('editClientEmail').value.trim().toLowerCase();
    const name=document.getElementById('editClientName').value.trim();
    const phone=document.getElementById('editClientPhone').value.trim();
    const city=document.getElementById('editClientCity').value.trim()||'Grajaú - MA';
    const avatarData=avatarPicker.get()||'';
    if(!window.ACCloud?.enabled && (db.clients||[]).some(x=>x.id!==c.id&&x.email.toLowerCase()===email)){msg.innerHTML='<div class="notice error">Este e-mail já está em uso.</div>';return;}
    if(window.ACCloud?.enabled){
      const submit=e.currentTarget.querySelector('button[type="submit"]');submit.disabled=true;msg.innerHTML='<div class="notice">Salvando perfil...</div>';
      const result=await window.ACCloud.updateClientProfile(c.id,{name,phone,email,avatarData});submit.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível atualizar o perfil.')}</div>`;return;}
      c.name=result.profile?.nome||name;c.phone=result.profile?.telefone||phone;c.email=result.user?.email||c.email;c.city=city;c.avatar=result.profile?.avatar_url||'';saveDb();
      msg.innerHTML=`<div class="notice success">Perfil atualizado.${result.emailChangePending?' Confira o novo e-mail para confirmar a alteração.':''}</div>`;
      setTimeout(profile,800);return;
    }
    c.name=name;c.email=email;c.phone=phone;c.city=city;c.avatar=avatarData;saveDb();msg.innerHTML='<div class="notice success">Perfil atualizado com sucesso.</div>';setTimeout(profile,550);
  };
}

function clientLogin() {
  app.innerHTML = `<main class="app-shell auth-page"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Minha conta</b></div><section class="auth-shell"><div class="auth-brand">${logo()}<span>Conta do cliente</span><h1>Bem-vindo de volta</h1><p>Entre para acessar favoritos e preferências.</p></div><form class="auth-card" id="clientLoginForm"><label>E-mail<input id="clientEmail" type="email" required autocomplete="username" placeholder="seuemail@exemplo.com"></label><label>Senha<div class="password-field"><input id="clientPassword" type="password" required autocomplete="current-password" placeholder="Sua senha"><button type="button" class="password-toggle" data-password-toggle="clientPassword" aria-label="Mostrar senha">${icon('eye')}</button></div></label><button class="forgot-link" type="button" data-go="clientForgot">Esqueci minha senha</button><button class="btn btn-yellow btn-block" type="submit">Entrar</button><div class="auth-divider"><span>ou</span></div><button class="btn btn-secondary btn-block" type="button" data-go="clientRegister">Criar minha conta</button><div id="clientLoginMsg"></div>${window.ACCloud?.enabled?'':'<button class="demo-fill" type="button" id="fillClientDemo">Usar acesso de demonstração</button>'}</form></section></main>`;
  bind();
  document.getElementById('fillClientDemo')?.addEventListener('click',()=>{document.getElementById('clientEmail').value='cliente@exemplo.com';document.getElementById('clientPassword').value='123456';});
  document.getElementById('clientLoginForm').onsubmit = async e => { e.preventDefault(); const email=document.getElementById('clientEmail').value.trim().toLowerCase(); const password=document.getElementById('clientPassword').value; const msg=document.getElementById('clientLoginMsg'); if(window.ACCloud?.enabled){ msg.innerHTML='<div class="notice">Entrando...</div>'; const result=await window.ACCloud.signInClient(email,password); if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'E-mail ou senha inválidos.')}</div>`;return;} upsertCloudClient(result.profile,result.user); await finishClientAccess(result.user.id); return; } const found=(db.clients||[]).find(c=>c.email.toLowerCase()===email&&c.password===password); if(!found){msg.innerHTML='<div class="notice error">E-mail ou senha inválidos.</div>';return;} await finishClientAccess(found.id); };
}

function clientRegister() {
  app.innerHTML = `<main class="app-shell auth-page"><div class="page-head"><button class="back" data-go="clientLogin" aria-label="Voltar">${icon('arrowLeft')}</button><b>Criar conta</b></div><section class="auth-shell"><div class="auth-brand"><span>Conta do cliente</span><h1>Crie sua conta</h1><p>Leva menos de um minuto.</p></div><form class="auth-card" id="clientRegisterForm"><label>Nome completo<input id="clientRegName" required placeholder="Seu nome"></label><label>E-mail<input id="clientRegEmail" type="email" required autocomplete="username" placeholder="seuemail@exemplo.com"></label><label>Senha<input id="clientRegPassword" type="password" minlength="6" required autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label><button class="btn btn-yellow btn-block" type="submit">Criar conta</button><div id="clientRegMsg"></div></form></section></main>`;
  bind();
  document.getElementById('clientRegisterForm').onsubmit=async e=>{e.preventDefault();const email=document.getElementById('clientRegEmail').value.trim().toLowerCase();const name=document.getElementById('clientRegName').value.trim();const password=document.getElementById('clientRegPassword').value;const msg=document.getElementById('clientRegMsg');if(window.ACCloud?.enabled){msg.innerHTML='<div class="notice">Criando sua conta...</div>';const result=await window.ACCloud.signUpClient({name,email,password});if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível criar a conta.')}</div>`;return;}if(result.needsEmailConfirmation){msg.innerHTML='<div class="notice success">Conta criada. Confira seu e-mail para confirmar o acesso.</div>';return;}upsertCloudClient(result.profile,result.user);await finishClientAccess(result.user.id);return;}if((db.clients||[]).some(c=>c.email.toLowerCase()===email)){msg.innerHTML='<div class="notice error">Este e-mail já possui uma conta.</div>';return;}const client={id:id('cliente'),name,email,password,phone:'',city:'Grajaú - MA',favorites:[]};db.clients=db.clients||[];db.clients.push(client);await finishClientAccess(client.id);};
}

function clientForgot() {
  app.innerHTML = `<main class="app-shell auth-page"><div class="page-head"><button class="back" data-go="clientLogin" aria-label="Voltar">${icon('arrowLeft')}</button><b>Recuperar acesso</b></div><section class="auth-shell"><div class="auth-brand"><span>Recuperação de senha</span><h1>Recupere sua conta</h1><p>Informe o e-mail usado no cadastro.</p></div><form class="auth-card" id="clientForgotForm"><label>E-mail<input id="forgotEmail" type="email" required placeholder="seuemail@exemplo.com"></label><button class="btn btn-yellow btn-block" type="submit">Enviar instruções</button><div id="forgotMsg"></div></form></section></main>`;
  bind(); document.getElementById('clientForgotForm').onsubmit=async e=>{e.preventDefault();const msg=document.getElementById('forgotMsg');const email=document.getElementById('forgotEmail').value.trim().toLowerCase();if(window.ACCloud?.enabled){try{localStorage.setItem('achou_recovery_target','client')}catch(_){}const result=await window.ACCloud.resetPassword(email);msg.innerHTML=result.ok?'<div class="notice success">Enviamos as instruções. Abra o link do e-mail para definir uma nova senha.</div>':`<div class="notice error">${esc(result.message||'Não foi possível enviar o e-mail.')}</div>`;return;}msg.innerHTML='<div class="notice success">No sistema conectado ao backend, o link de recuperação será enviado para este e-mail.</div>';};
}

function passwordResetConfirm() {
  publicState.passwordRecovery=true;
  let target='client';
  try { target=localStorage.getItem('achou_recovery_target')||'client'; } catch (_) {}
  app.innerHTML = `<main class="app-shell auth-page"><div class="page-head"><span></span><b>Nova senha</b></div><section class="auth-shell"><div class="auth-brand">${logo()}<span>SEGURANÇA DA CONTA</span><h1>Defina sua nova senha</h1><p>Crie uma senha com pelo menos 6 caracteres para recuperar seu acesso.</p></div><form class="auth-card" id="passwordResetForm"><label>Nova senha<input id="newPassword" type="password" minlength="6" required autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label><label>Confirmar nova senha<input id="newPasswordConfirm" type="password" minlength="6" required autocomplete="new-password" placeholder="Digite novamente"></label><button class="btn btn-yellow btn-block" type="submit">Salvar nova senha</button><div id="passwordResetMsg"></div></form></section></main>`;
  document.getElementById('passwordResetForm').onsubmit=async e=>{
    e.preventDefault();
    const password=document.getElementById('newPassword').value;
    const confirm=document.getElementById('newPasswordConfirm').value;
    const msg=document.getElementById('passwordResetMsg');
    if(password!==confirm){msg.innerHTML='<div class="notice error">As senhas não conferem.</div>';return;}
    const button=e.currentTarget.querySelector('button[type="submit"]');button.disabled=true;msg.innerHTML='<div class="notice">Atualizando senha...</div>';
    const result=await window.ACCloud?.updatePassword(password);button.disabled=false;
    if(!result?.ok){msg.innerHTML=`<div class="notice error">${esc(result?.message||'Não foi possível atualizar a senha.')}</div>`;return;}
    msg.innerHTML='<div class="notice success">Senha atualizada com sucesso. Você já pode entrar novamente.</div>';
    try{localStorage.removeItem('achou_recovery_target')}catch(_){}
    await window.ACCloud?.signOut();
    db.session.clientId=null;db.session.merchantId=null;db.session.admin=false;saveDb();
    publicState.passwordRecovery=false;
    setTimeout(()=>target==='merchant'?merchantLogin():clientLogin(),900);
  };
}

function recentSearches() {
  const list = db.recentSearches || [];
  app.innerHTML = `<main class="app-shell utility-page"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Minhas buscas</b></div><section class="utility-content"><div class="utility-hero"><span>${icon('search')}</span><div><small>HISTÓRICO</small><h1>Buscas recentes</h1><p>Retome rapidamente o que você procurou no app.</p></div></div><div class="history-list">${list.length ? list.map((q,i)=>`<button class="history-item" data-history-search="${esc(q)}"><span class="history-icon">${icon('clock')}</span><span><b>${esc(q)}</b><small>Buscar novamente</small></span>${icon('arrowRight','history-arrow')}</button>`).join('') : `<div class="professional-empty"><span>${icon('search')}</span><h3>Nenhuma busca recente</h3><p>Quando você pesquisar um produto, ele aparecerá aqui.</p><button class="btn btn-yellow" data-go="search">Começar uma busca</button></div>`}</div>${list.length ? '<button class="utility-clear" id="clearSearchHistory">Limpar histórico</button>' : ''}</section>${nav('profile')}</main>`;
  bind();
  document.querySelectorAll('[data-history-search]').forEach(btn=>btn.onclick=()=>search(btn.dataset.historySearch));
  document.getElementById('clearSearchHistory')?.addEventListener('click',()=>{db.recentSearches=[];saveDb();recentSearches();});
}

function notifications() {
  const items = db.notifications || [];
  items.forEach(n=>n.read=true); saveDb();
  app.innerHTML = `<main class="app-shell utility-page"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Notificações</b></div><section class="utility-content"><div class="utility-hero"><span>${icon('bell')}</span><div><small>CENTRAL DE AVISOS</small><h1>Novidades para você</h1><p>Ofertas e informações importantes do Achou, Comprou.</p></div></div><div class="notification-list">${items.length ? items.map(n=>`<article class="notification-card"><span class="notification-icon">${icon(n.type==='offer'?'flame':'bell')}</span><div><b>${esc(n.title)}</b><p>${esc(n.text)}</p><small>${n.type==='offer'?'Oferta local':'Informação do sistema'}</small></div></article>`).join('') : `<div class="professional-empty"><span>${icon('bell')}</span><h3>Tudo em dia</h3><p>Você não possui novas notificações.</p></div>`}</div></section>${nav('profile')}</main>`;
  bind();
}

function clientSettings() {
  db.clientSettings = db.clientSettings || { offers:true, favorites:true, local:true };
  const c = db.clientSettings;
  app.innerHTML = `<main class="app-shell utility-page"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Configurações</b></div><section class="utility-content"><div class="utility-hero"><span>${icon('settings')}</span><div><small>PREFERÊNCIAS</small><h1>Seu Achou, Comprou</h1><p>Escolha quais avisos deseja acompanhar.</p></div></div><div class="settings-card"><label><span><b>Ofertas perto de mim</b><small>Receber novidades de promoções locais.</small></span><input type="checkbox" data-setting="offers" ${c.offers?'checked':''}><i></i></label><label><span><b>Lojas e produtos favoritos</b><small>Novidades do que você salvou.</small></span><input type="checkbox" data-setting="favorites" ${c.favorites?'checked':''}><i></i></label><label><span><b>Novidades da cidade</b><small>Destaques do comércio local.</small></span><input type="checkbox" data-setting="local" ${c.local?'checked':''}><i></i></label></div><div class="settings-note"><b>Privacidade</b><p>O acesso da conta já usa o sistema online. Estas preferências de notificação continuam salvas neste aparelho por enquanto.</p></div></section>${nav('profile')}</main>`;
  bind();
  document.querySelectorAll('[data-setting]').forEach(input=>input.onchange=()=>{db.clientSettings[input.dataset.setting]=input.checked;saveDb();});
}

function planCards(mode='preview') {
  const m = currentMerchant();
  const button = (plan, label) => mode === 'preview'
    ? `<button class="btn ${plan === 'gratis' ? 'btn-secondary' : 'btn-yellow'} btn-block" data-plan-preview="${plan}">${label}</button>`
    : mode === 'onboarding'
      ? `<button class="btn ${plan === 'gratis' ? 'btn-secondary' : 'btn-yellow'} btn-block" data-onboard-plan="${plan}">${label}</button>`
      : `<button class="btn ${plan === 'gratis' ? 'btn-secondary' : 'btn-yellow'} btn-block" ${plan === 'gratis' ? '' : `data-request-plan="${plan}"`}>${m?.plan === plan ? 'Plano atual' : label}</button>`;
  return `<div class="plans plans-pro">
    <article class="plan plan-pro"><div class="plan-topline"><span>COMECE GRÁTIS</span></div><h4>Grátis</h4><div class="amount">R$ 0,00<span>/mês</span></div><p class="plan-desc">Para colocar sua loja no Achou, Comprou e começar a testar.</p><ul><li>${icon('check')} Até 2 produtos</li><li>${icon('check')} Até 2 ofertas por mês</li><li>${icon('check')} Botão de WhatsApp</li><li>${icon('check')} Página básica da loja</li></ul>${button('gratis', mode==='preview'?'Cadastrar loja grátis':mode==='onboarding'?'Começar no Grátis':'Plano básico')}</article>
    <article class="plan plan-pro featured"><div class="plan-topline"><span>MAIS RECURSOS</span></div><h4>Premium</h4><div class="amount">R$ 49,90<span>/mês</span></div><p class="plan-desc">Para lojas que querem publicar sem limite e ganhar mais presença.</p><ul><li>${icon('check')} Produtos ilimitados</li><li>${icon('check')} Ofertas ilimitadas</li><li>${icon('check')} Selo de destaque</li><li>${icon('check')} Prioridade nas categorias</li><li>${icon('check')} Estatísticas avançadas</li><li>${icon('check')} Página completa da loja</li></ul>${button('premium', mode==='preview'?'Quero o Premium':mode==='onboarding'?'Escolher Premium':'Solicitar Premium')}</article>
    <article class="plan plan-pro featured banner-plan"><div class="plan-ribbon">MAIOR VISIBILIDADE</div><div class="plan-topline"><span>DESTAQUE NA HOME</span></div><h4>Premium + Banner</h4><div class="amount">R$ 59,90<span>/mês</span></div><p class="plan-desc">Tudo do Premium, mais presença no banner principal do aplicativo.</p><ul><li>${icon('check')} Tudo do Premium</li><li>${icon('check')} Produtos e ofertas ilimitados</li><li>${icon('check')} Página completa da loja</li><li>${icon('check')} Loja no banner principal</li></ul>${button('premium_banner', mode==='preview'?'Quero Premium + Banner':mode==='onboarding'?'Escolher Premium + Banner':'Solicitar Premium + Banner')}</article>
  </div>`;
}

function plansPreview() {
  app.innerHTML = `<main class="app-shell plans-page"><div class="page-head"><button class="back" data-go="merchantLogin" aria-label="Voltar">${icon('arrowLeft')}</button><b>Planos para lojas</b></div><header class="plans-hero"><span>ACHOU, COMPROU PARA EMPRESAS</span><h1>Escolha como sua loja vai aparecer.</h1><p>Comece grátis e evolua quando quiser.</p></header><section class="plans-wrap">${planCards('preview')}<div class="plans-note">O plano Premium + Banner custa <b>R$ 59,90/mês no total</b>. Não é soma com o Premium.</div></section></main>`;
  bind(); document.querySelectorAll('[data-plan-preview]').forEach(btn=>btn.onclick=()=>{publicState.merchantPlanIntent=btn.dataset.planPreview;merchantRegister();});
}

function merchantLogin() {
  app.innerHTML = `<main class="app-shell auth-page merchant-auth"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Área do lojista</b></div><section class="auth-shell"><div class="auth-brand merchant-auth-brand">${logo()}<span>Portal do comerciante</span><h1>Gerencie sua loja</h1><p>Produtos, ofertas, desempenho e plano em um único painel.</p></div><form class="auth-card" id="merchantLoginForm"><label>E-mail<input id="merchantEmail" type="email" autocomplete="username" required placeholder="seuemail@exemplo.com"></label><label>Senha<div class="password-field"><input id="merchantPassword" type="password" autocomplete="current-password" required placeholder="Sua senha"><button type="button" class="password-toggle" data-password-toggle="merchantPassword" aria-label="Mostrar senha">${icon('eye')}</button></div></label><button class="forgot-link" type="button" id="merchantForgot">Esqueci minha senha</button><button class="btn btn-yellow btn-block" type="submit">Entrar no painel</button><div class="auth-divider"><span>Primeiro acesso?</span></div><button class="btn btn-secondary btn-block" type="button" data-go="merchantRegister">Cadastrar minha loja</button><button class="btn btn-outline btn-block" type="button" data-go="plansPreview">Ver planos e benefícios</button><div id="loginMsg"></div>${window.ACCloud?.enabled?'':'<button class="demo-fill" type="button" id="fillMerchantDemo">Usar acesso de demonstração</button>'}</form><button class="admin-discreet" data-go="adminLogin">Acesso administrativo</button></section></main>`;
  bind();
  document.getElementById('fillMerchantDemo')?.addEventListener('click',()=>{document.getElementById('merchantEmail').value='lojista@exemplo.com';document.getElementById('merchantPassword').value='123456';});
  document.getElementById('merchantForgot').onclick=async()=>{const email=document.getElementById('merchantEmail').value.trim().toLowerCase();const msg=document.getElementById('loginMsg');if(!email){msg.innerHTML='<div class="notice error">Digite seu e-mail para recuperar a senha.</div>';return;}if(window.ACCloud?.enabled){try{localStorage.setItem('achou_recovery_target','merchant')}catch(_){}const result=await window.ACCloud.resetPassword(email);msg.innerHTML=result.ok?'<div class="notice success">Enviamos as instruções. Abra o link do e-mail para definir uma nova senha.</div>':`<div class="notice error">${esc(result.message||'Não foi possível enviar o e-mail.')}</div>`;return;}msg.innerHTML='<div class="notice success">A recuperação será enviada por e-mail quando o backend estiver conectado.</div>';};
  document.getElementById('merchantLoginForm').onsubmit = async e => { e.preventDefault(); const email = document.getElementById('merchantEmail').value.trim().toLowerCase(); const password = document.getElementById('merchantPassword').value; const msg=document.getElementById('loginMsg'); if(window.ACCloud?.enabled){msg.innerHTML='<div class="notice">Entrando...</div>';const result=await window.ACCloud.signInMerchant(email,password);if(!result.ok){if(result.needsMerchantSetup){publicState.merchantExistingAccount={user:result.user,profile:result.profile,email};publicState.merchantPlanIntent='';merchantRegister();return;}msg.innerHTML=`<div class="notice error">${esc(result.message||'E-mail ou senha inválidos.')}</div>`;return;}publicState.merchantExistingAccount=null;upsertCloudMerchant(result.store,result.user);db.session.admin=false;db.session.clientId=null;db.session.merchantId=result.store.id;await syncCloudMerchantCatalog(result.store.id);saveDb();syncPublicStoreState();merchant();return;} const found = db.merchants.find(m => m.email.toLowerCase() === email && m.password === password); if (!found) { msg.innerHTML = '<div class="notice error">E-mail ou senha inválidos.</div>'; return; } db.session.merchantId = found.id; saveDb(); merchant(); };
}

function merchantRegister() {
  const existingAccount=publicState.merchantExistingAccount;
  const existingName=existingAccount?.profile?.nome||existingAccount?.user?.user_metadata?.nome||'';
  const existingEmail=existingAccount?.email||existingAccount?.user?.email||'';
  const intent = publicState.merchantPlanIntent ? `<div class="selected-plan-hint">Plano de interesse: <b>${planLabel(publicState.merchantPlanIntent)}</b>. Você poderá confirmar ou trocar na próxima etapa.</div>` : '';
  const categoryOptions=['Moda','Calçados','Acessórios','Alimentação','Beleza','Saúde','Tecnologia','Casa','Automotivo','Serviços','Outros'];
  app.innerHTML = `<main class="app-shell form-page merchant-register-page">
    <div class="page-head"><button class="back" data-go="merchantLogin" aria-label="Voltar">${icon('arrowLeft')}</button><b>${existingAccount?'Concluir cadastro da loja':'Cadastrar minha loja'}</b></div>
    <div class="register-progress"><span class="active">1</span><i></i><span>2</span><i></i><span>3</span><small>Dados</small><small>Plano</small><small>Aprovação</small></div>
    <form class="form-card merchant-register-card" id="merchantRegisterForm">
      <div class="form-intro"><span class="section-icon">${icon('store')}</span><div><h2>Dados da empresa</h2><p>Preencha os dados comerciais e fiscais para análise da loja.</p></div></div>
      ${intent}
      ${existingAccount?'<div class="notice success">Encontramos sua conta de cliente. Complete os dados abaixo e ela passará a ter acesso de lojista usando o mesmo e-mail.</div>':''}
      <div class="merchant-form-section"><div><span>RESPONSÁVEL</span><h3>Acesso da conta</h3></div></div>
      <label>Nome do responsável<input id="regOwner" required placeholder="Nome completo" value="${esc(existingName)}"></label>
      <div class="merchant-form-section"><div><span>EMPRESA</span><h3>Dados cadastrais</h3></div></div>
      <label>Nome da loja<input id="regName" required placeholder="Ex.: Loja Exemplo"></label>
      <label>Razão social<input id="regLegalName" required placeholder="Razão social registrada no CNPJ"></label>
      <div class="two-cols merchant-legal-grid">
        <label>CNPJ<input id="regCnpj" required inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00"></label>
        <label class="notranslate" translate="no">Inscrição Estadual<input id="regStateRegistration" required placeholder="Número ou ISENTO"></label>
      </div>
      <label>Endereço completo<input id="regAddress" required placeholder="Rua, número, bairro, cidade - UF"></label>

      <div class="merchant-form-section"><div><span>CATEGORIAS</span><h3>O que sua loja vende?</h3><p>Escolha de 1 a 3 categorias.</p></div><strong id="categoryCounter">0/3</strong></div>
      <div class="merchant-category-picker" id="merchantCategoryPicker">
        ${categoryOptions.map(cat=>`<label class="merchant-category-option"><input type="checkbox" name="regCategories" value="${cat}"><span>${cat}</span></label>`).join('')}
      </div>
      <div id="categoryMsg"></div>

      <div class="merchant-form-section"><div><span>CONTATO</span><h3>Informações públicas da loja</h3></div></div>
      <div class="two-cols">
        <label>WhatsApp<input id="regWhatsapp" required inputmode="tel" placeholder="(99) 99999-9999"></label>
        <label>Instagram<input id="regInstagram" placeholder="@sualoja"></label>
      </div>
      <div class="merchant-form-section schedule-heading"><div><span>HORÁRIOS</span><h3>Horário de funcionamento</h3><p>Informe o horário de cada dia ou marque quando a loja estiver fechada.</p></div></div>
      ${weeklyHoursMarkup('regHours',defaultWeeklyHours())}
      <label>Descrição<textarea id="regDescription" placeholder="Conte um pouco sobre a loja"></textarea></label>

      <div class="merchant-form-section"><div><span>LOGIN</span><h3>Crie seu acesso</h3></div></div>
      ${existingAccount
        ? `<label>E-mail de acesso<input id="regEmail" type="email" value="${esc(existingEmail)}" readonly><input id="regPassword" type="hidden" value=""></label><div class="field-help">Você continuará usando a mesma senha dessa conta.</div>`
        : `<div class="two-cols"><label>E-mail de acesso<input id="regEmail" type="email" required autocomplete="username" placeholder="seuemail@exemplo.com"></label><label>Senha<input id="regPassword" type="password" minlength="6" required autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label></div>`}
      <button class="btn btn-yellow btn-block" type="submit">Continuar para os planos</button>
      <div id="regMsg"></div>
    </form>
  </main>`;
  bind();

  const categoryInputs=[...document.querySelectorAll('input[name="regCategories"]')];
  const categoryCounter=document.getElementById('categoryCounter');
  const categoryMsg=document.getElementById('categoryMsg');
  const updateCategoryState=()=>{
    const selected=categoryInputs.filter(x=>x.checked);
    categoryCounter.textContent=`${selected.length}/3`;
    categoryInputs.forEach(x=>{x.disabled=!x.checked&&selected.length>=3;});
    categoryMsg.innerHTML=selected.length>=3?'<div class="field-help">Limite de 3 categorias atingido.</div>':'';
  };
  categoryInputs.forEach(input=>input.addEventListener('change',updateCategoryState));
  bindWeeklyHoursEditor('regHours');

  const cnpjInput=document.getElementById('regCnpj');
  cnpjInput.addEventListener('input',()=>{
    const d=cnpjInput.value.replace(/\D/g,'').slice(0,14);
    cnpjInput.value=d.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');
  });

  document.getElementById('merchantRegisterForm').onsubmit = e => {
    e.preventDefault();
    const categories=categoryInputs.filter(x=>x.checked).map(x=>x.value);
    const cnpj=document.getElementById('regCnpj').value.trim();
    const cnpjDigits=cnpj.replace(/\D/g,'');
    const schedule=collectWeeklyHours('regHours');
    const msg=document.getElementById('regMsg');
    if(!schedule.ok){msg.innerHTML=`<div class="notice error">${esc(schedule.message)}</div>`;return;}
    const draft={
      owner:document.getElementById('regOwner').value.trim(),
      name:document.getElementById('regName').value.trim(),
      legalName:document.getElementById('regLegalName').value.trim(),
      cnpj,
      stateRegistration:document.getElementById('regStateRegistration').value.trim(),
      categories,
      category:categories[0]||'',
      whatsapp:document.getElementById('regWhatsapp').value.trim(),
      instagram:document.getElementById('regInstagram').value.trim(),
      address:document.getElementById('regAddress').value.trim(),
      hours:schedule.summary,
      weeklyHours:schedule.data,
      description:document.getElementById('regDescription').value.trim(),
      email:document.getElementById('regEmail').value.trim().toLowerCase(),
      password:document.getElementById('regPassword').value
    };
    if(categories.length<1 || categories.length>3){
      msg.innerHTML='<div class="notice error">Escolha pelo menos 1 e no máximo 3 categorias.</div>';
      return;
    }
    if(cnpjDigits.length!==14){
      msg.innerHTML='<div class="notice error">Informe um CNPJ válido com 14 números.</div>';
      cnpjInput.focus();
      return;
    }
    if(!draft.stateRegistration){
      msg.innerHTML='<div class="notice error">Informe a inscrição estadual ou digite ISENTO.</div>';
      return;
    }
    if(!window.ACCloud?.enabled && db.merchants.some(m => m.email.toLowerCase() === draft.email)) {
      msg.innerHTML = '<div class="notice error">Já existe uma loja cadastrada com esse e-mail.</div>';
      return;
    }
    publicState.merchantDraft=draft;
    if(window.ACCloud?.enabled){
      merchantPlanOnboarding();
      return;
    }
    const merchantId=id('loja');
    db.merchants.push({ id:merchantId, ...draft, status:'rascunho', plan:'gratis', rating:'Novo', dist:'—' });
    db.session.merchantId=merchantId;
    saveDb();
    syncPublicStoreState();
    merchantPlanOnboarding();
  };
}

function merchantPlanOnboarding() {
  const m=currentMerchant();
  const draft=publicState.merchantDraft;
  if(!m && !(window.ACCloud?.enabled && draft)) return merchantLogin();
  app.innerHTML=`<main class="app-shell plans-page"><div class="page-head"><button class="back" data-go="${window.ACCloud?.enabled?'merchantRegister':'merchant'}" aria-label="Voltar">${icon('arrowLeft')}</button><b>Escolher plano</b></div><div class="register-progress"><span>${icon('check')}</span><i class="done"></i><span class="active">2</span><i></i><span>3</span><small>Dados</small><small>Plano</small><small>Aprovação</small></div><header class="plans-hero compact"><span>ETAPA 2 DE 3</span><h1>Como você quer começar?</h1><p>Você pode mudar de plano depois.</p><div id="planOnboardMsg"></div></header><section class="plans-wrap">${planCards('onboarding')}</section></main>`;
  bind();
  document.querySelectorAll('[data-onboard-plan]').forEach(btn=>btn.onclick=async()=>{
    const chosen=btn.dataset.onboardPlan;
    if(window.ACCloud?.enabled){
      const msg=document.getElementById('planOnboardMsg');
      document.querySelectorAll('[data-onboard-plan]').forEach(b=>b.disabled=true);
      msg.innerHTML='<div class="notice">Criando seu acesso e cadastrando a loja...</div>';
      const result=publicState.merchantExistingAccount
        ? await window.ACCloud.convertClientToMerchant({...draft,plan:chosen})
        : await window.ACCloud.signUpMerchant({...draft,plan:chosen});
      if(!result.ok){
        document.querySelectorAll('[data-onboard-plan]').forEach(b=>b.disabled=false);
        msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível concluir o cadastro.')}</div>`;
        return;
      }
      publicState.merchantPlanIntent='';
      if(result.needsEmailConfirmation){
        publicState.merchantDraft=null;
        merchantSubmitted(chosen,{name:draft.name,email:draft.email,needsEmailConfirmation:true});
        return;
      }
      if(result.store&&result.user){
        upsertCloudMerchant(result.store,result.user);
        db.session.admin=false;
        db.session.merchantId=result.store.id;
        db.session.clientId=null;
        saveDb();
        syncPublicStoreState();
      }
      publicState.merchantDraft=null;
      publicState.merchantExistingAccount=null;
      merchantSubmitted(chosen,{name:draft.name});
      return;
    }
    m.plan='gratis';
    m.requestedPlan=chosen==='gratis'?null:chosen;
    m.status='aguardando';
    publicState.merchantPlanIntent='';
    publicState.merchantDraft=null;
    saveDb();
    syncPublicStoreState();
    merchantSubmitted(chosen);
  });
}

function merchantSubmitted(chosen='gratis', options={}) {
  const m=currentMerchant();
  const displayName=options.name || m?.name || 'Sua loja';
  const paid=chosen!=='gratis';
  const emailPending=!!options.needsEmailConfirmation;
  app.innerHTML=`<main class="app-shell submission-page"><div class="submission-card"><div class="submission-check">${icon('check')}</div><span>ETAPA 3 DE 3</span><h1>${emailPending?'Confirme seu e-mail':'Cadastro enviado'}</h1><p>${emailPending?`Enviamos um link de confirmação para <b>${esc(options.email||'seu e-mail')}</b>. Depois de confirmar, entre na Área do Lojista para concluir a criação da loja.`:`Sua loja <b>${esc(displayName)}</b> está aguardando aprovação para aparecer no Achou, Comprou.`}</p><div class="submission-summary"><div><small>Plano escolhido</small><strong>${planLabel(chosen)}</strong></div><div><small>Status</small><strong>${emailPending?'E-mail pendente':'Aguardando aprovação'}</strong></div></div>${paid?`<div class="notice">O plano <b>${planLabel(chosen)}</b> ficará como solicitado. No MVP, a ativação acontece após a confirmação manual do Pix.</div>`:''}${emailPending?`<div class="notice">Ao confirmar o e-mail, o sistema cria sua loja automaticamente no banco com o plano Grátis ativo e registra sua solicitação de <b>${planLabel(chosen)}</b> quando for um plano pago.</div>`:''}<button class="btn btn-yellow btn-block" data-go="${emailPending?'merchantLogin':'merchant'}">${emailPending?'Ir para o login':'Ir para meu painel'}</button><button class="btn btn-outline btn-block" data-go="home">Voltar ao aplicativo</button></div></main>`;
  bind();
}

function metric(iconName, label, value, small = '') {
  return `<div class="metric"><div class="metric-top"><span class="metric-icon">${icon(iconName)}</span><span>${label}</span></div><strong>${value}</strong>${small ? `<small>${small}</small>` : ''}</div>`;
}

function merchantDeviceClass(){
  const width=window.innerWidth || document.documentElement.clientWidth || 390;
  const coarse=window.matchMedia?.('(pointer: coarse)')?.matches || false;
  if(width>=1024 && !coarse)return 'merchant-desktop';
  if(width>=700)return 'merchant-tablet';
  return 'merchant-mobile';
}
function merchantDeviceLabel(){
  const mode=merchantDeviceClass();
  return mode==='merchant-desktop'?'Computador':mode==='merchant-tablet'?'Tablet':'Celular';
}
function applyMerchantDeviceMode(){
  const shell=document.querySelector('.merchant');
  if(!shell)return;
  shell.classList.remove('merchant-mobile','merchant-tablet','merchant-desktop');
  shell.classList.add(merchantDeviceClass());
  const chip=document.querySelector('[data-merchant-device-label]');
  if(chip)chip.textContent=merchantDeviceLabel();
}

function merchantNav(active = 'dashboard') {
  const items = [
    ['merchant','home','Painel','dashboard'],
    ['merchantProducts','package','Produtos','products'],
    ['merchantOffers','flame','Ofertas','offers'],
    ['merchantStore','store','Minha loja','store'],
    ['plans','star','Plano','plan']
  ];
  return `<nav class="merchant-bottom-nav">${items.map(([go, ico, label, key]) => `<button class="${active === key ? 'active' : ''}" data-go="${go}">${icon(ico)}<span>${label}</span></button>`).join('')}</nav>`;
}

function merchant() {
  const m = currentMerchant(); if (!m) return merchantLogin();
  const products = merchantProductsFor(m.id);
  const activeProducts = products.filter(p => p.status === 'ativo');
  const offers = merchantOffersFor(m.id).filter(o => o.active);
  const statusText = m.status === 'aprovada' ? 'Loja publicada' : m.status === 'aguardando' ? 'Aguardando aprovação' : 'Cadastro em análise';
  const statusClass = m.status === 'aprovada' ? 'approved' : 'pending';
  const planText = planLabel(m.plan);
  const lastProducts = products.slice(-3).reverse();
  const lastOffer = offers.slice(-1)[0];
  const pending = m.status !== 'aprovada' ? `<div class="merchant-alert">${icon('clock')}<div><b>${statusText}</b><span>Você pode preparar produtos e ofertas. A loja só aparece para clientes depois da aprovação.</span></div></div>` : '';
  const heroCover=m.coverData?`<img class="merchant-dash-cover" src="${esc(m.coverData)}" alt="">`:'';
  const shopLogo=m.logoData?`<img src="${esc(m.logoData)}" alt="Logo ${esc(m.name)}">`:icon('store');

  app.innerHTML = `<main class="app-shell merchant ${merchantDeviceClass()} merchant-dashboard-pro">
    <header class="merchant-dash-hero ${m.coverData?'has-cover':''}">
      ${heroCover}<div class="merchant-dash-overlay"></div>
      <div class="merchant-dash-brand">
        <div><span>PAINEL DO LOJISTA</span><b>Achou, Comprou</b></div>
        <div class="merchant-dash-tools">
          <span class="merchant-device-chip">${icon('grid')} <b data-merchant-device-label>${merchantDeviceLabel()}</b></span>
          <button class="merchant-ghost-icon" data-store-id="${m.id}" aria-label="Ver loja pública">${icon('eye')}</button>
        </div>
      </div>
      <div class="merchant-shop-main">
        <div class="merchant-shop-avatar ${m.logoData?'with-logo':''}">${shopLogo}</div>
        <div class="merchant-shop-copy"><h1>${esc(m.name)}</h1><p>${esc(m.category)}</p><div class="merchant-status ${statusClass}"><i></i>${statusText}</div></div>
      </div>
      <div class="merchant-plan-strip"><div><small>PLANO ATUAL</small><strong>${planText}</strong>${m.requestedPlan ? `<span>${planLabel(m.requestedPlan)} solicitado</span>` : ''}</div><button data-go="plans">Gerenciar ${icon('arrowRight')}</button></div>
    </header>

    <section class="merchant-dashboard-body">
      ${pending}
      <div class="merchant-section-heading"><div><span>VISÃO GERAL</span><h2>Resumo da loja</h2></div><small>${window.ACCloud?.enabled ? 'Dados online' : 'Dados locais'}</small></div>
      <div class="merchant-kpi-grid">
        <article class="merchant-kpi"><span>${icon('eye')}</span><small>Visualizações</small><strong>0</strong><em>Ainda sem registros</em></article>
        <article class="merchant-kpi"><span>${icon('chat')}</span><small>WhatsApp</small><strong>0</strong><em>Ainda sem registros</em></article>
        <article class="merchant-kpi"><span>${icon('package')}</span><small>Produtos ativos</small><strong>${activeProducts.length}</strong><em>${products.length} no total</em></article>
        <article class="merchant-kpi"><span>${icon('flame')}</span><small>Ofertas ativas</small><strong>${offers.length}</strong><em>${m.plan === 'gratis' ? 'Limite de 2/mês' : 'Ilimitadas'}</em></article>
      </div>

      <div class="merchant-section-heading quick-heading"><div><span>ATALHOS</span><h2>Ações rápidas</h2></div></div>
      <div class="merchant-quick-grid">
        <button class="primary" data-go="productForm"><span>${icon('plus')}</span><div><b>Novo produto</b><small>Adicionar ao catálogo</small></div>${icon('arrowRight','merchant-arrow')}</button>
        <button data-go="offerForm"><span>${icon('flame')}</span><div><b>Nova oferta</b><small>Criar promoção</small></div>${icon('arrowRight','merchant-arrow')}</button>
        <button data-go="merchantStore"><span>${icon('store')}</span><div><b>Minha loja</b><small>Logo, capa e informações</small></div>${icon('arrowRight','merchant-arrow')}</button>
        <button data-go="stats"><span>${icon('chart')}</span><div><b>Estatísticas</b><small>Acompanhar desempenho</small></div>${icon('arrowRight','merchant-arrow')}</button>
      </div>

      <div class="merchant-dashboard-panels">
        <section class="merchant-panel-card">
          <div class="merchant-panel-head"><div><span>CATÁLOGO</span><h3>Produtos recentes</h3></div><button data-go="merchantProducts">Ver todos</button></div>
          <div class="merchant-recent-list">${lastProducts.length ? lastProducts.map(p => `<button data-product-id="${p.id}"><div class="merchant-product-thumb">${productMedia(p, true)}</div><div><b>${esc(p.name)}</b><span>${categoryLabel(p.type)} · ${money(p.promo || p.price)}</span></div><i class="merchant-mini-status ${p.status === 'ativo' ? 'on' : ''}">${p.status === 'ativo' ? 'Ativo' : 'Pausado'}</i></button>`).join('') : `<div class="merchant-empty-mini"><b>Seu catálogo está vazio</b><span>Cadastre o primeiro produto para começar.</span><button data-go="productForm">Cadastrar produto</button></div>`}</div>
        </section>

        <section class="merchant-panel-card">
          <div class="merchant-panel-head"><div><span>PROMOÇÕES</span><h3>Oferta em destaque</h3></div><button data-go="merchantOffers">Gerenciar</button></div>
          ${lastOffer ? (() => { const p = db.products.find(x => x.id === lastOffer.productId); return `<div class="merchant-offer-highlight"><div><small>${p ? esc(p.name) : 'Produto'}</small><strong>${money(lastOffer.promo)}</strong><span>de ${money(lastOffer.normal)} · até ${lastOffer.validUntil ? new Date(lastOffer.validUntil+'T12:00:00').toLocaleDateString('pt-BR') : 'sem validade'}</span></div><div class="merchant-offer-badge">ATIVA</div></div>`; })() : `<div class="merchant-empty-line"><span>Nenhuma oferta ativa no momento.</span><button data-go="offerForm">Criar oferta</button></div>`}
        </section>
      </div>

      <button class="merchant-logout-link" id="merchantLogout">${icon('arrowLeft')} Sair da área do lojista</button>
    </section>
    ${merchantNav('dashboard')}
  </main>`;
  bind(); document.getElementById('merchantLogout').onclick = async () => { if(window.ACCloud?.enabled) await window.ACCloud.signOut(); db.session.merchantId = null; saveDb(); profile(); };
}

function merchantProducts() {
  const m = currentMerchant(); if (!m) return merchantLogin(); const products = merchantProductsFor(m.id);
  const activeCount = products.filter(p => p.status === 'ativo').length;
  app.innerHTML = `<main class="app-shell merchant ${merchantDeviceClass()} merchant-subpage">
    <div class="merchant-sub-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><div><span>CATÁLOGO</span><b>Meus produtos</b></div><button class="merchant-add-small" data-go="productForm">${icon('plus')} Novo</button></div>
    <section class="merchant-sub-body">
      <div class="merchant-summary-card"><div><small>Produtos cadastrados</small><strong>${products.length}</strong></div><div><small>Ativos</small><strong>${activeCount}</strong></div><div><small>Plano</small><strong>${planLabel(m.plan)}</strong></div></div>
      <div class="merchant-catalog-list">${products.length ? products.map(p => {
        const options=availabilitySummary(p);
        const photoCount=(Array.isArray(p.images)&&p.images.length)?p.images.length:(p.imageData?1:0);
        return `<article class="merchant-catalog-item">
          <div class="merchant-catalog-thumb">${productMedia(p, true)}</div>
          <div class="merchant-catalog-copy">
            <div><span>${categoryLabel(p.type)}</span><h3>${esc(p.name)}</h3></div>
            <strong>${money(p.promo || p.price)}</strong>
            ${options.length?`<div class="merchant-product-options">${options.slice(0,2).map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:'<div class="merchant-product-options missing"><span>Tamanhos/numerações ainda não informados</span></div>'}
            <small class="merchant-photo-count">${icon('image')} ${photoCount} foto${photoCount===1?'':'s'}</small>
            <small class="merchant-mini-status ${p.status === 'ativo' ? 'on' : ''}">${p.status === 'ativo' ? 'Ativo' : 'Pausado'}</small>
          </div>
          <div class="merchant-catalog-actions">
            <button data-product-id="${p.id}" aria-label="Ver produto">${icon('eye')}</button>
            <button data-edit-product="${p.id}">Editar</button>
            <button data-toggle-product="${p.id}">${p.status === 'ativo' ? 'Pausar' : 'Ativar'}</button>
            <button class="danger" data-delete-product="${p.id}">Excluir</button>
          </div>
        </article>`;
      }).join('') : '<div class="merchant-empty-state"><div>'+icon('package')+'</div><h3>Nenhum produto cadastrado</h3><p>Comece adicionando os produtos que seus clientes procuram.</p><button class="btn btn-yellow" data-go="productForm">Cadastrar primeiro produto</button></div>'}</div>
    </section>
    ${merchantNav('products')}
  </main>`;
  bind();
  document.querySelectorAll('[data-edit-product]').forEach(btn=>btn.onclick=()=>merchantProductEdit(btn.dataset.editProduct));
  document.querySelectorAll('[data-toggle-product]').forEach(btn => btn.onclick = async () => {
    const prod = db.products.find(x => x.id === btn.dataset.toggleProduct); if (!prod) return;
    const nextActive=prod.status !== 'ativo';
    if(window.ACCloud?.enabled){btn.disabled=true;const result=await window.ACCloud.setProductActive(prod.id,nextActive);if(!result.ok){btn.disabled=false;alert(result.message||'Não foi possível alterar o produto.');return;}}
    prod.status = nextActive ? 'ativo' : 'pausado'; saveDb(); merchantProducts();
  });
  document.querySelectorAll('[data-delete-product]').forEach(btn => btn.onclick = async () => {
    const pid = btn.dataset.deleteProduct;
    if(window.ACCloud?.enabled){btn.disabled=true;const result=await window.ACCloud.deleteProduct(pid);if(!result.ok){btn.disabled=false;alert(result.message||'Não foi possível excluir o produto.');return;}}
    db.products = db.products.filter(x => x.id !== pid); db.offers = db.offers.filter(x => x.productId !== pid); saveDb(); merchantProducts();
  });
}

function merchantProductEdit(productId){
  const m=currentMerchant(); if(!m)return merchantLogin();
  const p=db.products.find(x=>x.id===productId && x.storeId===m.id); if(!p)return merchantProducts();
  const meta=normalizedProduct(p);
  const CLOTHING_ADULT=['Único','PP','P','M','G','GG','XG','XXG'];
  const CLOTHING_KIDS=['RN','1','2','4','6','8','10','12','14','16'];
  const FOOT_KIDS=Array.from({length:20},(_,i)=>String(i+13));
  const FOOT_ADULT=Array.from({length:18},(_,i)=>String(i+33));
  const PIZZA=['Pequena','Média','Grande','Família'];
  const selected=new Set((p.type==='calcado'?meta.numbers:meta.sizes).map(String));
  const choices=(values)=>values.map(v=>`<button type="button" class="product-choice-chip ${selected.has(String(v))?'active':''}" data-edit-choice="${esc(v)}">${esc(v)}</button>`).join('');
  let optionBlock='';
  if(p.type==='roupa') optionBlock=`<div class="product-choice-subtitle">Adulto</div><div class="product-choice-chips">${choices(CLOTHING_ADULT)}</div><div class="product-choice-subtitle">Infantil</div><div class="product-choice-chips">${choices(CLOTHING_KIDS)}</div>`;
  else if(p.type==='calcado') optionBlock=`<div class="product-choice-subtitle">Infantil · 13 ao 32</div><div class="product-choice-chips">${choices(FOOT_KIDS)}</div><div class="product-choice-subtitle">Adulto · 33 ao 50</div><div class="product-choice-chips">${choices(FOOT_ADULT)}</div>`;
  else if(p.type==='pizza') optionBlock=`<div class="product-choice-chips">${choices(PIZZA)}</div>`;

  const initialImages=(Array.isArray(p.images)&&p.images.length?p.images:(p.imageData?[p.imageData]:[]));
  app.innerHTML=`<main class="app-shell merchant ${merchantDeviceClass()} merchant-subpage">
    <div class="merchant-sub-head"><button class="back" data-go="merchantProducts" aria-label="Voltar">${icon('arrowLeft')}</button><div><span>PRODUTO</span><b>Tamanhos e fotos</b></div></div>
    <section class="merchant-sub-body">
      <div class="merchant-edit-product-head"><div class="merchant-edit-thumb">${productMedia(p,true)}</div><div><span>${categoryLabel(p.type)}</span><h2>${esc(p.name)}</h2><p>Atualize o que o cliente verá no produto.</p></div></div>
      <form class="form-card merchant-product-edit-form" id="merchantProductEditForm">
        <div class="product-media-field"><label class="media-label">Fotos do produto</label><input class="media-file-input" id="editProductImages" type="file" accept="image/*" multiple><div class="product-multi-preview" id="editProductImagesPreview"></div><small>Até 8 fotos. A primeira será a foto principal.</small></div>
        ${optionBlock?`<div class="product-choice-field"><div class="product-choice-title"><b>${p.type==='calcado'?'Numerações disponíveis':'Tamanhos disponíveis'}</b><small>Marque tudo que está disponível para o cliente.</small></div>${optionBlock}</div>`:''}
        ${p.type!=='pizza'? `<label>Cores disponíveis<input id="editProductColors" value="${esc(meta.colors.join(', '))}" placeholder="Preto, Branco, Azul"></label>` : ''}
        <button class="btn btn-yellow btn-block" type="submit">Salvar alterações</button>
        <div id="editProductMsg"></div>
      </form>
    </section>
    ${merchantNav('products')}
  </main>`;
  bind();
  const picker=bindMultiImagePicker('editProductImages','editProductImagesPreview',{initial:initialImages,max:8,maxW:1200,maxH:1200,quality:.8});
  document.querySelectorAll('[data-edit-choice]').forEach(btn=>btn.onclick=()=>btn.classList.toggle('active'));
  document.getElementById('merchantProductEditForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('editProductMsg');
    const values=[...document.querySelectorAll('[data-edit-choice].active')].map(x=>x.dataset.editChoice);
    if(['roupa','calcado','pizza'].includes(p.type)&&!values.length){
      msg.innerHTML=`<div class="notice error">Marque pelo menos ${p.type==='calcado'?'uma numeração':'um tamanho'}.</div>`;
      return;
    }
    const colors=p.type==='pizza'?[]:splitList(document.getElementById('editProductColors')?.value||'');
    const payload={
      productId:p.id,
      userId:m.ownerId || (await window.ACCloud?.getSession())?.user?.id,
      type:p.type,
      sizes:['roupa','pizza'].includes(p.type)?values:[],
      numbers:p.type==='calcado'?values:[],
      colors,
      images:picker.get()
    };
    const submit=e.currentTarget.querySelector('button[type="submit"]');
    if(window.ACCloud?.enabled){
      submit.disabled=true; msg.innerHTML='<div class="notice">Salvando tamanhos e fotos...</div>';
      const result=await window.ACCloud.updateProductOptions(payload);
      submit.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível salvar.')}</div>`;return;}
      const i=db.products.findIndex(x=>x.id===p.id); if(i>=0)db.products[i]=result.product;
    }else{
      p.sizes=payload.sizes;p.numbers=payload.numbers;p.colors=payload.colors;p.images=payload.images;p.imageData=payload.images[0]||p.imageData;
    }
    saveDb();
    msg.innerHTML='<div class="notice success">Tamanhos e fotos atualizados. O cliente já poderá visualizar.</div>';
    setTimeout(()=>merchantProductEdit(p.id),550);
  };
}

function merchantOffers() {
  const m = currentMerchant(); if (!m) return merchantLogin();
  const offers = merchantOffersFor(m.id).slice().reverse();
  const activeCount = offers.filter(o => o.active).length;
  const used = m.plan === 'gratis' ? Math.min(offers.length, 2) : offers.length;
  app.innerHTML = `<main class="app-shell merchant ${merchantDeviceClass()} merchant-subpage">
    <div class="merchant-sub-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><div><span>PROMOÇÕES</span><b>Minhas ofertas</b></div><button class="merchant-add-small" data-go="offerForm">${icon('plus')} Nova</button></div>
    <section class="merchant-sub-body">
      <div class="merchant-summary-card"><div><small>Ofertas ativas</small><strong>${activeCount}</strong></div><div><small>${m.plan === 'gratis' ? 'Uso mensal' : 'Publicadas'}</small><strong>${m.plan === 'gratis' ? `${used}/2` : offers.length}</strong></div><div><small>Plano</small><strong>${planLabel(m.plan)}</strong></div></div>
      <div class="merchant-offer-list">${offers.length ? offers.map(o => { const p=db.products.find(x=>x.id===o.productId); return `<article class="merchant-offer-item"><div class="merchant-offer-top"><div><span>${p ? esc(p.name) : 'Produto'}</span><strong>${money(o.promo)}</strong><small>Preço normal ${money(o.normal)}</small></div><i class="merchant-mini-status ${o.active ? 'on' : ''}">${o.active ? 'Ativa' : 'Pausada'}</i></div><div class="merchant-offer-meta"><span>${icon('clock')} ${o.validUntil ? `Até ${new Date(o.validUntil+'T12:00:00').toLocaleDateString('pt-BR')}` : 'Sem validade'}</span><span>${icon('package')} ${Number(o.quantity||0)} un.</span></div><div class="merchant-offer-actions"><button data-toggle-offer="${o.id}">${o.active ? 'Pausar oferta' : 'Ativar oferta'}</button><button class="danger" data-delete-offer="${o.id}">Excluir</button></div></article>`; }).join('') : '<div class="merchant-empty-state"><div>'+icon('flame')+'</div><h3>Nenhuma oferta criada</h3><p>Crie promoções para ganhar destaque na busca e na página inicial.</p><button class="btn btn-yellow" data-go="offerForm">Criar primeira oferta</button></div>'}</div>
    </section>
    ${merchantNav('offers')}
  </main>`;
  bind();
  document.querySelectorAll('[data-toggle-offer]').forEach(btn=>btn.onclick=async()=>{const o=db.offers.find(x=>x.id===btn.dataset.toggleOffer); if(!o)return; const active=!o.active; if(window.ACCloud?.enabled){btn.disabled=true;const result=await window.ACCloud.setOfferActive(o.id,active);if(!result.ok){btn.disabled=false;alert(result.message||'Não foi possível alterar a oferta.');return;}} o.active=active; saveDb(); merchantOffers();});
  document.querySelectorAll('[data-delete-offer]').forEach(btn=>btn.onclick=async()=>{const oid=btn.dataset.deleteOffer;if(window.ACCloud?.enabled){btn.disabled=true;const result=await window.ACCloud.deleteOffer(oid);if(!result.ok){btn.disabled=false;alert(result.message||'Não foi possível excluir a oferta.');return;}}db.offers=db.offers.filter(x=>x.id!==oid); saveDb(); merchantOffers();});
}

function merchantStore() {
  const m = currentMerchant(); if (!m) return merchantLogin();
  app.innerHTML = `<main class="app-shell merchant ${merchantDeviceClass()} merchant-subpage">
    <div class="merchant-sub-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><div><span>PERFIL COMERCIAL</span><b>Minha loja</b></div><button class="merchant-view-store" data-store-id="${m.id}">${icon('eye')}</button></div>
    <section class="merchant-sub-body">
      <div class="merchant-store-card"><div class="merchant-store-avatar ${m.logoData ? 'with-logo' : ''}">${m.logoData ? `<img src="${m.logoData}" alt="Logo ${esc(m.name)}">` : icon('store')}</div><div><span>${esc(m.category)}</span><h2>${esc(m.name)}</h2><p>${m.status === 'aprovada' ? 'Loja publicada no aplicativo' : 'Aguardando aprovação'}</p></div></div>
      <form class="merchant-store-form" id="merchantStoreForm">
        <div class="merchant-form-section"><div><span>IDENTIDADE VISUAL</span><h3>Logo e capa da loja</h3></div></div>
        <div class="store-media-grid">
          <div><label class="media-label">Logo da loja</label><input class="media-file-input" id="storeLogoFile" type="file" accept="image/*"><button class="media-picker square" type="button" id="storeLogoPreview"></button></div>
          <div><label class="media-label">Capa da loja</label><input class="media-file-input" id="storeCoverFile" type="file" accept="image/*"><button class="media-picker cover" type="button" id="storeCoverPreview"></button></div>
        </div>
        <div class="media-help">Use imagens nítidas. O protótipo reduz o arquivo automaticamente para não pesar no aplicativo.</div>
        <div class="merchant-form-section"><div><span>DADOS PRINCIPAIS</span><h3>Informações da loja</h3></div></div>
        <label>Nome da loja<input id="storeName" required value="${esc(m.name)}"></label>
        <label>Categoria principal<select id="storeCategory"><option ${m.category==='Moda'?'selected':''}>Moda</option><option ${m.category==='Moda e Calçados'?'selected':''}>Moda e Calçados</option><option ${m.category==='Calçados'?'selected':''}>Calçados</option><option ${m.category==='Alimentação'?'selected':''}>Alimentação</option><option ${m.category==='Beleza'?'selected':''}>Beleza</option><option ${m.category==='Saúde'?'selected':''}>Saúde</option><option ${m.category==='Tecnologia'?'selected':''}>Tecnologia</option><option ${m.category==='Casa'?'selected':''}>Casa</option><option ${m.category==='Automotivo'?'selected':''}>Automotivo</option><option ${m.category==='Serviços'?'selected':''}>Serviços</option><option ${m.category==='Outros'?'selected':''}>Outros</option></select></label>
        <div class="two-cols"><label>WhatsApp<input id="storeWhatsapp" value="${esc(m.whatsapp||'')}" placeholder="(99) 99999-9999"></label><label>Instagram<input id="storeInstagram" value="${esc(m.instagram||'')}" placeholder="@sualoja"></label></div>
        <label>Endereço<input id="storeAddress" value="${esc(m.address||'')}" placeholder="Rua, número, bairro"></label>
        <div class="merchant-form-section schedule-heading"><div><span>HORÁRIOS</span><h3>Horário de funcionamento</h3><p>Você pode alterar cada dia separadamente.</p></div></div>
        ${weeklyHoursMarkup('storeHours',m.weeklyHours&&Object.keys(m.weeklyHours).length?m.weeklyHours:defaultWeeklyHours())}
        <label>Descrição<textarea id="storeDescription" placeholder="Conte um pouco sobre a loja">${esc(m.description||'')}</textarea></label>
        <button class="btn btn-yellow btn-block" type="submit">Salvar alterações</button><div id="storeSaveMsg"></div>
      </form>
      <div class="merchant-account-card"><div><small>PLANO DA LOJA</small><strong>${planLabel(m.plan)}</strong><span>${m.requestedPlan ? `${planLabel(m.requestedPlan)} solicitado` : 'Gerencie benefícios e visibilidade.'}</span></div><button data-go="plans">Ver meu plano ${icon('arrowRight')}</button></div>
    </section>
    ${merchantNav('store')}
  </main>`;
  bind();
  const storeLogoPicker = bindImagePicker('storeLogoFile','storeLogoPreview',{initial:m.logoData||'',maxW:520,maxH:520,quality:.82,emptyTitle:'Adicionar logo',emptyText:'Formato quadrado'});
  const storeCoverPicker = bindImagePicker('storeCoverFile','storeCoverPreview',{initial:m.coverData||'',maxW:1200,maxH:650,quality:.76,emptyTitle:'Adicionar capa',emptyText:'Imagem horizontal'});
  bindWeeklyHoursEditor('storeHours');
  document.getElementById('merchantStoreForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('storeSaveMsg');
    const submit=e.currentTarget.querySelector('button[type="submit"]');
    const schedule=collectWeeklyHours('storeHours');
    if(!schedule.ok){msg.innerHTML=`<div class="notice error">${esc(schedule.message)}</div>`;return;}
    const patch={
      logoData:storeLogoPicker.get(), coverData:storeCoverPicker.get(),
      name:document.getElementById('storeName').value.trim(),
      category:document.getElementById('storeCategory').value,
      whatsapp:document.getElementById('storeWhatsapp').value.trim(),
      instagram:document.getElementById('storeInstagram').value.trim(),
      address:document.getElementById('storeAddress').value.trim(),
      hours:schedule.summary,
      weeklyHours:schedule.data,
      description:document.getElementById('storeDescription').value.trim()
    };
    if(window.ACCloud?.enabled){
      submit.disabled=true;msg.innerHTML='<div class="notice">Salvando dados e imagens...</div>';
      const session=await window.ACCloud.getSession();
      const result=await window.ACCloud.saveMerchantStore(m.id,m.ownerId||session?.user?.id,patch);
      submit.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível salvar a loja.')}</div>`;return;}
      if(session?.user) upsertCloudMerchant(result.store,session.user);
      syncPublicStoreState();
      msg.innerHTML='<div class="notice success">Loja atualizada no sistema online.</div>';
      return;
    }
    Object.assign(m,patch);saveDb();syncPublicStoreState();msg.innerHTML='<div class="notice success">Informações salvas com sucesso.</div>';
  };
}

function productForm() {
  const m = currentMerchant(); if (!m) return merchantLogin(); const ownProducts = merchantProductsFor(m.id); if (m.plan === 'gratis' && ownProducts.length >= 2) { app.innerHTML = `<main class="app-shell form-page"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Cadastrar produto</b></div><div class="form-card"><div class="notice">Seu plano Grátis permite até 2 produtos. Para cadastrar mais, escolha um plano Premium.</div><button class="btn btn-yellow btn-block" data-go="plans">Ver planos</button></div></main>`; bind(); return; }
  app.innerHTML = `<main class="app-shell form-page"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Cadastrar produto</b></div><form class="form-card" id="productFormEl"><div class="form-intro"><span class="section-icon">${icon('package')}</span><div><h2>Informações do produto</h2><p>Cadastre dados que o cliente poderá usar na busca inteligente.</p></div></div><div class="product-media-field"><label class="media-label">Fotos do produto</label><input class="media-file-input" id="prodImageFile" type="file" accept="image/*" multiple><div class="product-multi-preview" id="prodImagesPreview"></div><small>Adicione até 8 fotos. A primeira será a foto principal.</small></div><label>Nome<input id="prodName" required placeholder="Ex.: Tênis infantil"></label><label>Categoria<select id="prodCat"><option value="roupa">Roupa</option><option value="calcado">Calçado</option><option value="pizza">Pizza / Alimentação</option><option value="beleza">Beleza / Perfumaria</option><option value="celular">Celular</option><option value="outro">Outro</option></select></label><label>Marca<input id="prodBrand" placeholder="Marca"></label><div class="two-cols"><label>Preço normal<input id="prodPrice" required placeholder="159,90"></label><label>Preço promocional<input id="prodPromo" placeholder="129,90"></label></div><div id="dynamicFields"></div><label>Controle de estoque<select id="prodStock"><option value="simples">Simples — disponível/indisponível</option><option value="detalhado">Detalhado — por variação</option></select></label><div id="variantSection" class="hidden"><div class="variation-head"><div><b>Variações e quantidade</b><span>Ex.: Nº 28 / Rosa / 2 unidades</span></div><button class="mini-action" id="addVariant" type="button">${icon('plus')} Adicionar</button></div><div id="variantRows"></div></div><label>Descrição<textarea id="prodDescription" placeholder="Descrição do produto"></textarea></label><button class="btn btn-yellow btn-block" type="submit">Salvar produto</button><div id="saveMsg"></div></form></main>`;
  bind();
  const productImagePicker = bindMultiImagePicker('prodImageFile','prodImagesPreview',{max:8,maxW:1200,maxH:1200,quality:.8});
  const sel = document.getElementById('prodCat'), box = document.getElementById('dynamicFields'), stock = document.getElementById('prodStock'), variantSection=document.getElementById('variantSection'), variantRows=document.getElementById('variantRows');
  const CLOTHING_ADULT_SIZES=['Único','PP','P','M','G','GG','XG','XXG'];
  const CLOTHING_KIDS_SIZES=['RN','1','2','4','6','8','10','12','14','16'];
  const FOOTWEAR_KIDS_NUMBERS=Array.from({length:20},(_,i)=>String(i+13));
  const FOOTWEAR_ADULT_NUMBERS=Array.from({length:18},(_,i)=>String(i+33));
  const PIZZA_SIZES=['Pequena','Média','Grande','Família'];
  function choiceButtons(values,group='size'){
    return values.map(v=>`<button type="button" class="product-choice-chip" data-choice-group="${group}" data-choice-value="${esc(v)}">${esc(v)}</button>`).join('');
  }
  function syncMarkedSizes(){
    const hidden=document.getElementById('prodExtra1');
    if(!hidden)return;
    hidden.value=[...box.querySelectorAll('[data-choice-group="size"].active')].map(b=>b.dataset.choiceValue).join(', ');
  }
  function bindChoiceButtons(){
    box.querySelectorAll('[data-choice-group="size"]').forEach(btn=>{
      btn.onclick=()=>{
        btn.classList.toggle('active');
        syncMarkedSizes();
      };
    });
  }
  function dyn() {
    const map = {
      roupa: `<div class="product-choice-field"><div class="product-choice-title"><b>Tamanhos disponíveis</b><small>Marque todos os tamanhos deste produto.</small></div><div class="product-choice-subtitle">Adulto</div><div class="product-choice-chips">${choiceButtons(CLOTHING_ADULT_SIZES)}</div><div class="product-choice-subtitle">Infantil</div><div class="product-choice-chips">${choiceButtons(CLOTHING_KIDS_SIZES)}</div><input id="prodExtra1" type="hidden"></div><label>Cores disponíveis<input id="prodExtra2" placeholder="Preto, Branco, Rosa"></label>`,
      calcado: `<div class="product-choice-field"><div class="product-choice-title"><b>Numerações disponíveis</b><small>Marque todas as numerações que você tem.</small></div><div class="product-choice-subtitle">Infantil · 13 ao 32</div><div class="product-choice-chips">${choiceButtons(FOOTWEAR_KIDS_NUMBERS)}</div><div class="product-choice-subtitle">Adulto · 33 ao 50</div><div class="product-choice-chips">${choiceButtons(FOOTWEAR_ADULT_NUMBERS)}</div><input id="prodExtra1" type="hidden"></div><label>Cores disponíveis<input id="prodExtra2" placeholder="Preto, Azul"></label>`,
      pizza: `<div class="product-choice-field"><div class="product-choice-title"><b>Tamanhos</b><small>Marque os tamanhos vendidos.</small></div><div class="product-choice-chips">${choiceButtons(PIZZA_SIZES)}</div><input id="prodExtra1" type="hidden"></div><label>Sabores / adicionais<input id="prodExtra2" placeholder="Calabresa, Frango, Catupiry"></label>`,
      beleza: '<label>Tipo / volume<input id="prodExtra1" placeholder="Perfume 100 ml"></label><label>Variações<input id="prodExtra2" placeholder="Feminino, Masculino"></label>',
      celular: '<label>Modelo / armazenamento<input id="prodExtra1" placeholder="Modelo / 128 GB / 8 GB RAM"></label><label>Cores<input id="prodExtra2" placeholder="Preto, Branco"></label>',
      outro: '<label>Características<input id="prodExtra1" placeholder="Principais características"></label><input id="prodExtra2" type="hidden">'
    };
    box.innerHTML = map[sel.value];
    bindChoiceButtons();
    refreshVariantLabels();
  }
  function optionLabel(){ return sel.value === 'calcado' ? 'Numeração' : sel.value === 'roupa' ? 'Tamanho' : sel.value === 'pizza' ? 'Tamanho' : 'Variação'; }
  function variantOptionControl(option=''){
    if(sel.value==='roupa'){
      const all=[...CLOTHING_ADULT_SIZES,...CLOTHING_KIDS_SIZES];
      return `<select class="variant-option">${all.map(v=>`<option value="${esc(v)}" ${String(option)===String(v)?'selected':''}>${esc(v)}</option>`).join('')}</select>`;
    }
    if(sel.value==='calcado'){
      const all=[...FOOTWEAR_KIDS_NUMBERS,...FOOTWEAR_ADULT_NUMBERS];
      return `<select class="variant-option">${all.map(v=>`<option value="${esc(v)}" ${String(option)===String(v)?'selected':''}>${esc(v)}</option>`).join('')}</select>`;
    }
    if(sel.value==='pizza'){
      return `<select class="variant-option">${PIZZA_SIZES.map(v=>`<option value="${esc(v)}" ${String(option)===String(v)?'selected':''}>${esc(v)}</option>`).join('')}</select>`;
    }
    return `<input class="variant-option" value="${esc(option)}" placeholder="Opção">`;
  }
  function addVariantRow(option='',color='',qty=1){ const row=document.createElement('div'); row.className='variation-row'; row.innerHTML=`<label><span class="variation-label">${optionLabel()}</span>${variantOptionControl(option)}</label><label>Cor / opção<input class="variant-color" value="${esc(color)}" placeholder="Ex.: Preto"></label><label>Qtd.<input class="variant-qty" type="number" min="0" value="${Number(qty)||0}"></label><button type="button" class="variant-remove" aria-label="Remover">×</button>`; row.querySelector('.variant-remove').onclick=()=>row.remove(); variantRows.appendChild(row); }
  function refreshVariantLabels(){ variantRows.querySelectorAll('.variation-label').forEach(x=>x.textContent=optionLabel()); }
  function stockMode(){ variantSection.classList.toggle('hidden',stock.value !== 'detalhado'); if(stock.value==='detalhado' && !variantRows.children.length) addVariantRow(); }
  sel.onchange = dyn; stock.onchange=stockMode; document.getElementById('addVariant').onclick=()=>addVariantRow(); dyn(); stockMode();
  document.getElementById('productFormEl').onsubmit = async e => {
    e.preventDefault();
    const msg=document.getElementById('saveMsg');
    const submit=e.currentTarget.querySelector('button[type="submit"]');
    const type = sel.value;
    const art = type === 'calcado' ? 'shoe' : type === 'roupa' ? 'shirt' : type === 'pizza' ? 'pizza' : 'bag';
    const ex1 = document.getElementById('prodExtra1')?.value.trim() || '';
    const ex2 = document.getElementById('prodExtra2')?.value.trim() || '';
    const list1=splitList(ex1), list2=splitList(ex2);
    if(['roupa','pizza'].includes(type) && !list1.length){
      msg.innerHTML='<div class="notice error">Marque pelo menos um tamanho disponível.</div>';
      return;
    }
    if(type==='calcado' && !list1.length){
      msg.innerHTML='<div class="notice error">Marque pelo menos uma numeração disponível.</div>';
      return;
    }
    const variants=[...document.querySelectorAll('.variation-row')].map(row=>({option:row.querySelector('.variant-option').value.trim(),color:row.querySelector('.variant-color').value.trim(),qty:Number(row.querySelector('.variant-qty').value||0)})).filter(v=>v.option||v.color);
    const colors = type === 'pizza' ? [] : [...new Set([...list2,...variants.map(v=>v.color).filter(Boolean)])];
    const sizes = ['roupa','pizza'].includes(type) ? [...new Set([...list1,...variants.map(v=>v.option).filter(Boolean)])] : [];
    const numbers = type === 'calcado' ? [...new Set([...list1,...variants.map(v=>v.option).filter(Boolean)])] : [];
    const payload={
      storeId:m.id,
      userId:m.ownerId || (await window.ACCloud?.getSession())?.user?.id,
      type, art,
      imageData:productImagePicker.get()[0]||'',
      images:productImagePicker.get(),
      name:document.getElementById('prodName').value.trim(),
      brand:document.getElementById('prodBrand').value.trim(),
      price:document.getElementById('prodPrice').value.trim(),
      promo:document.getElementById('prodPromo').value.trim(),
      details:document.getElementById('prodDescription').value.trim(),
      sizes,numbers,colors,
      variants: stock.value==='detalhado' ? variants : [],
      stock:stock.value,
      status:'ativo'
    };
    if(window.ACCloud?.enabled){
      submit.disabled=true; msg.innerHTML='<div class="notice">Enviando produto e imagem...</div>';
      const result=await window.ACCloud.createProduct(payload);
      submit.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível cadastrar o produto.')}</div>`;return;}
      db.products.push(result.product); saveDb();
      msg.innerHTML='<div class="notice success">Produto salvo no sistema online com sucesso.</div>';
      setTimeout(merchantProducts,650); return;
    }
    db.products.push({ id:id('produto'), ...payload }); saveDb();
    msg.innerHTML = '<div class="notice success">Produto cadastrado com dados de busca e estoque.</div>';
    setTimeout(merchantProducts,650);
  };
}

function offerForm() {
  const m = currentMerchant(); if (!m) return merchantLogin(); const products = merchantProductsFor(m.id).filter(p => p.status === 'ativo'); const monthOffers = merchantOffersFor(m.id).filter(o => { const match = String(o.id||'').match(/(\d{13})/); const d = o.createdAt ? new Date(o.createdAt) : new Date(match ? Number(match[1]) : Date.now()); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }); if (m.plan === 'gratis' && monthOffers.length >= 2) { app.innerHTML = `<main class="app-shell form-page"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Criar oferta</b></div><div class="form-card"><div class="notice">Seu plano Grátis permite até 2 ofertas por mês. Para publicar mais, escolha um plano Premium.</div><button class="btn btn-yellow btn-block" data-go="plans">Ver planos</button></div></main>`; bind(); return; }
  app.innerHTML = `<main class="app-shell form-page"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Criar oferta</b></div><form class="form-card" id="offerFormEl">${products.length ? `<label>Produto<select id="offerProduct">${products.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><div class="two-cols"><label>Preço normal<input id="offerNormal" required placeholder="159,90"></label><label>Preço promocional<input id="offerPromo" required placeholder="129,90"></label></div><label>Validade<input id="offerUntil" type="date" required></label><label>Quantidade disponível<input id="offerQty" type="number" min="1" value="1" required></label><button class="btn btn-yellow btn-block" type="submit">Publicar oferta</button><div id="offerMsg"></div>` : '<div class="notice">Cadastre pelo menos um produto ativo antes de criar uma oferta.</div><button class="btn btn-yellow btn-block" type="button" data-go="productForm">Cadastrar produto</button>'}</form></main>`;
  bind();
  const form = document.getElementById('offerFormEl');
  if (products.length) form.onsubmit = async e => {
    e.preventDefault();
    const msg=document.getElementById('offerMsg');
    const submit=e.currentTarget.querySelector('button[type="submit"]');
    const payload={
      storeId:m.id,
      productId:document.getElementById('offerProduct').value,
      normal:document.getElementById('offerNormal').value.trim(),
      promo:document.getElementById('offerPromo').value.trim(),
      validUntil:document.getElementById('offerUntil').value,
      quantity:Number(document.getElementById('offerQty').value)
    };
    if(window.ACCloud?.enabled){
      submit.disabled=true; msg.innerHTML='<div class="notice">Publicando oferta...</div>';
      const result=await window.ACCloud.createOffer(payload);
      submit.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível publicar a oferta.')}</div>`;return;}
      db.offers.push(result.offer); saveDb();
      msg.innerHTML='<div class="notice success">Oferta publicada no sistema online.</div>';
      setTimeout(merchant,500); return;
    }
    db.offers.push({ id:id('oferta'), ...payload, active:true }); saveDb();
    msg.innerHTML = '<div class="notice success">Oferta publicada com sucesso.</div>';
    setTimeout(merchant,500);
  };
}

async function stats() {
  const m=currentMerchant(); if(!m)return merchantLogin();
  let counts={visualizacao_loja:0,clique_whatsapp:0,favorito:0,visualizacao_produto:0};
  let counts30={visualizacao_loja:0,clique_whatsapp:0,favorito:0,visualizacao_produto:0};
  let byProduct={}, whatsappByProduct={}, uniqueVisitors30=0, ratingAverage=null, ratingCount=0;
  if(window.ACCloud?.enabled){
    const result=await window.ACCloud.merchantStats(m.id);
    if(result.ok){
      counts=result.counts||counts;
      counts30=result.counts30||counts30;
      byProduct=result.byProduct||{};
      whatsappByProduct=result.whatsappByProduct||{};
      uniqueVisitors30=result.uniqueVisitors30||0;
      ratingAverage=result.ratingAverage;
      ratingCount=result.ratingCount||0;
    }
  }
  const products=merchantProductsFor(m.id);
  const ranked=products.map(p=>({p,n:byProduct[p.id]||0})).sort((a,b)=>b.n-a.n).slice(0,5);
  const contacts=products.map(p=>({p,n:whatsappByProduct[p.id]||0})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,5);
  const max=Math.max(1,...ranked.map(x=>x.n));
  const contactMax=Math.max(1,...contacts.map(x=>x.n));
  app.innerHTML = `<main class="app-shell merchant ${merchantDeviceClass()}"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Estatísticas</b></div>
  <div class="report-period"><b>Resultados dos últimos 30 dias</b><span>Use estes números para acompanhar o retorno do Achou, Comprou.</span></div>
  <div class="metric-grid">
    ${metric('user','Pessoas alcançadas',String(uniqueVisitors30),'Visitantes únicos')}
    ${metric('chat','Contatos no WhatsApp',String(counts30.clique_whatsapp||0),'Últimos 30 dias')}
    ${metric('eye','Visualizações da loja',String(counts30.visualizacao_loja||0),'Últimos 30 dias')}
    ${metric('star','Satisfação',ratingAverage==null?'—':`${ratingAverage.toFixed(1)} ★`,ratingCount?`${ratingCount} avaliação(ões)`:'Ainda sem avaliações')}
  </div>
  <div class="chart-card"><div class="section-title compact-title"><h3>Produtos que mais geraram contatos</h3><span>WhatsApp</span></div>${contacts.length?contacts.map(x=>`<div class="bar"><span>${esc(x.p.name)}</span><i style="width:${Math.max(4,x.n/contactMax*92)}%"></i><b>${x.n}</b></div>`).join(''):'<div class="notice">Ainda não houve contato de WhatsApp em um produto específico.</div>'}</div>
  <div class="chart-card"><div class="section-title compact-title"><h3>Produtos mais vistos</h3><span>Desde o início</span></div>${ranked.length?ranked.map(x=>`<div class="bar"><span>${esc(x.p.name)}</span><i style="width:${Math.max(4,x.n/max*92)}%"></i><b>${x.n}</b></div>`).join(''):'<div class="notice">Ainda não há visualizações de produtos registradas.</div>'}</div>
  ${merchantNav('dashboard')}</main>`;
  bind();
}

async function plans() {
  const m = currentMerchant(); if (!m) return merchantLogin();
  if(window.ACCloud?.enabled) await syncMerchantPayments(m.id);
  const history=(db.payments||[]).filter(p=>p.storeId===m.id).slice(0,4);
  const expiry=m.plan!=='gratis'&&m.planExpiresAt?`<div class="plan-expiry-note">Ativo até <b>${formatDateBR(m.planExpiresAt)}</b></div>`:'';
  app.innerHTML = `<main class="app-shell merchant ${merchantDeviceClass()} plans-page">
    <div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Meu plano</b></div>
    <header class="plans-hero compact"><span>PLANO ATUAL: ${planLabel(m.plan).toUpperCase()}</span><h1>Escolha o nível de presença da sua loja.</h1><p>Planos pagos são liberados por 30 dias após a confirmação do PIX.</p>${expiry}</header>
    <section class="plans-wrap">${planCards('account')}<div id="planMsg" class="plans-note">${m.status!=='aprovada'?'Sua loja precisa ser aprovada antes de realizar o pagamento.':'Escolha um plano pago para gerar a solicitação de PIX.'}</div></section>
    ${history.length?`<section class="merchant-payment-history"><div class="section-title"><h3>Pagamentos</h3><a>Histórico</a></div>${history.map(p=>`<button class="payment-history-row" data-payment-open="${p.id}"><div><b>${planLabel(p.plan)}</b><small>${formatDateBR(p.requestedAt)} · ${brlNumber(p.value)}</small></div><span class="admin-status ${paymentStatusClass(p.status)}">${paymentStatusLabel(p.status)}</span></button>`).join('')}</section>`:''}
    ${merchantNav('plan')}
  </main>`;
  bind();
  document.querySelectorAll('[data-payment-open]').forEach(btn=>btn.onclick=()=>merchantPayment(btn.dataset.paymentOpen));
  document.querySelectorAll('[data-request-plan]').forEach(btn => btn.onclick = async () => {
    const requested=btn.dataset.requestPlan;
    const msg=document.getElementById('planMsg');
    if(m.status!=='aprovada'){msg.innerHTML='<div class="notice error">Sua loja ainda precisa ser aprovada antes do pagamento.</div>';return;}
    if(window.ACCloud?.enabled){
      btn.disabled=true;msg.innerHTML='<div class="notice">Gerando solicitação de pagamento...</div>';
      const result=await window.ACCloud.requestPlanPayment(m.id,requested);
      btn.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível gerar o pagamento.')}</div>`;return;}
      m.requestedPlan=requested;
      db.payments=(db.payments||[]).filter(p=>p.id!==result.payment.id);
      db.payments.unshift(result.payment);
      saveDb();
      merchantPayment(result.payment.id);
      return;
    }
    const payment={id:id('pay'),storeId:m.id,plan:requested,value:planPrice(requested),status:'aguardando',method:'pix',requestedAt:new Date().toISOString()};
    db.payments.unshift(payment);m.requestedPlan=requested;saveDb();merchantPayment(payment.id);
  });
}

async function merchantPayment(paymentId) {
  const m=currentMerchant(); if(!m)return merchantLogin();
  if(window.ACCloud?.enabled) await syncMerchantPayments(m.id);
  const payment=paymentById(paymentId)||(db.payments||[]).find(p=>p.storeId===m.id&&['aguardando','em_analise','recusado'].includes(p.status));
  if(!payment)return plans();
  const cfg=db.paymentConfig||{};
  const paid=payment.status==='pago';
  const reviewing=payment.status==='em_analise';
  app.innerHTML=`<main class="app-shell merchant ${merchantDeviceClass()} payment-page">
    <div class="page-head"><button class="back" data-go="plans" aria-label="Voltar">${icon('arrowLeft')}</button><b>Pagamento do plano</b></div>
    <section class="payment-hero">
      <span>${planLabel(payment.plan).toUpperCase()}</span>
      <h1>${brlNumber(payment.value)}</h1>
      <p>${paid?'Pagamento confirmado e plano ativado por 30 dias.':reviewing?'Seu comprovante foi enviado e está aguardando conferência.':'Faça o PIX e envie o comprovante para análise.'}</p>
      <span class="admin-status ${paymentStatusClass(payment.status)}">${paymentStatusLabel(payment.status)}</span>
    </section>
    ${paid?`
      <section class="payment-success-card"><div class="payment-success-icon">${icon('check')}</div><h2>Plano ativo</h2><p>Período: <b>${formatDateBR(payment.periodStart)}</b> até <b>${formatDateBR(payment.periodEnd)}</b>.</p><button class="btn btn-yellow btn-block" data-go="merchant">Voltar ao painel</button></section>
    `:`
      <section class="payment-pix-card">
        <div class="payment-section-title"><span>1</span><div><b>Faça o PIX</b><small>Valor exato: ${brlNumber(payment.value)}</small></div></div>
        ${cfg.pixKey?`
          <div class="pix-qr-wrap">
            <div class="pix-qr-box"><div id="pixQrCanvas" class="pix-qr-render" aria-label="QR Code PIX"></div><small id="pixQrStatus">Aponte a câmera do banco para o QR Code</small></div>
            <div class="pix-copy-card"><small>PIX COPIA E COLA</small><textarea id="pixCopyPaste" readonly aria-label="PIX copia e cola"></textarea><button type="button" id="copyPixPayload">Copiar código PIX</button></div>
          </div>
          <div class="pix-key-box"><small>CHAVE PIX</small><strong id="pixKeyText">${esc(cfg.pixKey)}</strong><button type="button" id="copyPixKey">Copiar chave</button></div>
          <div class="pix-owner"><b>${esc(cfg.pixName||'Beneficiário não informado')}</b><span>${esc(cfg.pixCity||'Grajaú - MA')}</span></div>
        `:'<div class="notice error">A chave PIX ainda não foi configurada pelo administrador.</div>'}
        ${cfg.instruction?`<p class="payment-instruction">${esc(cfg.instruction)}</p>`:''}
      </section>
      <section class="payment-proof-card">
        <div class="payment-section-title"><span>2</span><div><b>${reviewing?'Comprovante enviado':'Envie o comprovante'}</b><small>Imagem ou PDF, até 8 MB.</small></div></div>
        ${reviewing?'<div class="notice success">Recebemos seu comprovante. O plano será ativado somente depois da confirmação do administrador.</div>':`
          ${payment.status==='recusado'?`<div class="notice error">O comprovante anterior foi recusado.${payment.note?` Motivo: ${esc(payment.note)}`:''} Envie um novo comprovante.</div>`:''}
          <input class="payment-proof-input" id="paymentProofFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf">
          <button class="btn btn-yellow btn-block" id="sendPaymentProof" type="button" ${!cfg.pixKey?'disabled':''}>Já paguei · enviar comprovante</button>
          <div id="paymentProofMsg"></div>
        `}
      </section>
      <div class="payment-security-note">O plano não é ativado apenas pelo envio do comprovante. A liberação acontece após a conferência no painel administrativo.</div>
    `}
    ${merchantNav('plan')}
  </main>`;
  bind();
  const pixPayload=cfg.pixKey?buildPixCopyPaste({key:cfg.pixKey,name:cfg.pixName,city:cfg.pixCity,amount:payment.value}):'';
  const pixTextArea=document.getElementById('pixCopyPaste');
  if(pixTextArea)pixTextArea.value=pixPayload;
  const pixCanvas=document.getElementById('pixQrCanvas');
  const pixQrStatus=document.getElementById('pixQrStatus');
  if(pixCanvas&&pixPayload){
    try{
      if(typeof window.QRCode==='function'){
        pixCanvas.innerHTML='';
        new window.QRCode(pixCanvas,{
          text:pixPayload,
          width:220,
          height:220,
          colorDark:'#000000',
          colorLight:'#ffffff',
          correctLevel:window.QRCode.CorrectLevel?.M ?? 0
        });
        if(pixQrStatus)pixQrStatus.textContent='Aponte a câmera do banco para o QR Code';
      }else if(pixQrStatus){
        pixQrStatus.textContent='QR Code indisponível. Use o PIX copia e cola.';
      }
    }catch(err){
      console.error('Falha ao gerar QR Code PIX',err);
      if(pixQrStatus)pixQrStatus.textContent='Não foi possível gerar o QR Code. Use o PIX copia e cola.';
    }
  }
  document.getElementById('copyPixPayload')?.addEventListener('click',async e=>{
    if(!pixPayload)return;
    try{await navigator.clipboard.writeText(pixPayload);e.currentTarget.textContent='Código copiado';setTimeout(()=>e.currentTarget.textContent='Copiar código PIX',1400);}catch(_){pixTextArea?.select();document.execCommand?.('copy');}
  });
  document.getElementById('copyPixKey')?.addEventListener('click',async e=>{
    try{await navigator.clipboard.writeText(cfg.pixKey);e.currentTarget.textContent='Copiado';setTimeout(()=>e.currentTarget.textContent='Copiar chave',1200);}catch(_){alert('Copie a chave PIX exibida na tela.');}
  });
  document.getElementById('sendPaymentProof')?.addEventListener('click',async e=>{
    const file=document.getElementById('paymentProofFile')?.files?.[0];
    const msg=document.getElementById('paymentProofMsg');
    if(!file){msg.innerHTML='<div class="notice error">Selecione o comprovante antes de enviar.</div>';return;}
    if(file.size>8*1024*1024){msg.innerHTML='<div class="notice error">O arquivo deve ter no máximo 8 MB.</div>';return;}
    if(window.ACCloud?.enabled){
      e.currentTarget.disabled=true;msg.innerHTML='<div class="notice">Enviando comprovante...</div>';
      const result=await window.ACCloud.uploadPaymentProof(payment.id,file);
      if(!result.ok){e.currentTarget.disabled=false;msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível enviar o comprovante.')}</div>`;return;}
      db.payments=(db.payments||[]).map(p=>p.id===result.payment.id?result.payment:p);saveDb();merchantPayment(result.payment.id);return;
    }
    payment.status='em_analise';payment.paidAt=new Date().toISOString();saveDb();merchantPayment(payment.id);
  });
}

function adminLogin() {
  app.innerHTML = `<main class="app-shell admin-login-page"><section class="admin-login-shell"><button class="admin-back-link" data-go="merchantLogin">${icon('arrowLeft')} Voltar</button><div class="admin-login-brand"><span class="admin-lock-mark">${icon('settings')}</span><span>ADMINISTRAÇÃO</span><h1>Central de gestão</h1><p>Acesso exclusivo para administração do Achou, Comprou.</p></div><form class="admin-login-card" id="adminLoginForm"><label>E-mail<input id="adminEmail" type="email" autocomplete="username" required placeholder="E-mail administrativo"></label><label>Senha<div class="password-field"><input id="adminPassword" type="password" autocomplete="current-password" required placeholder="Sua senha"><button type="button" class="password-toggle" data-password-toggle="adminPassword" aria-label="Mostrar senha">${icon('eye')}</button></div></label><button class="btn btn-yellow btn-block" type="submit">Entrar no painel</button><div id="adminLoginMsg"></div>${window.ACCloud?.enabled?'':'<button class="demo-fill" type="button" id="fillAdminDemo">Usar acesso de demonstração</button>'}</form></section></main>`;
  bind();
  document.getElementById('fillAdminDemo')?.addEventListener('click',()=>{document.getElementById('adminEmail').value='admin@achoucomprou.local';document.getElementById('adminPassword').value='admin123';});
  document.getElementById('adminLoginForm').onsubmit = async e => {
    e.preventDefault();
    const email=document.getElementById('adminEmail').value.trim().toLowerCase();
    const password=document.getElementById('adminPassword').value;
    const msg=document.getElementById('adminLoginMsg');
    if(window.ACCloud?.enabled){
      msg.innerHTML='<div class="notice">Entrando...</div>';
      const result=await window.ACCloud.signInAdmin(email,password);
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Acesso administrativo inválido.')}</div>`;return;}
      db.session.admin=true;db.session.clientId=null;db.session.merchantId=null;await syncCloudAdminData();saveDb();admin();return;
    }
    if (email !== 'admin@achoucomprou.local' || password !== 'admin123') {msg.innerHTML = '<div class="notice error">Acesso administrativo inválido.</div>'; return;}
    db.session.admin = true; saveDb(); admin();
  };
}

function adminDeviceClass(){
  const width=window.innerWidth || document.documentElement.clientWidth || 390;
  const coarse=window.matchMedia?.('(pointer: coarse)')?.matches || false;
  if(width>=1024 && !coarse)return 'admin-desktop';
  if(width>=700)return 'admin-tablet';
  return 'admin-mobile';
}
function adminDeviceLabel(){
  const mode=adminDeviceClass();
  return mode==='admin-desktop'?'Computador':mode==='admin-tablet'?'Tablet':'Celular';
}
function applyAdminDeviceMode(){
  const shell=document.querySelector('.admin-pro');
  if(!shell)return;
  shell.classList.remove('admin-mobile','admin-tablet','admin-desktop');
  const mode=adminDeviceClass();
  shell.classList.add(mode);
  shell.dataset.device=mode.replace('admin-','');
  const chip=document.querySelector('[data-admin-device-label]');
  if(chip)chip.textContent=adminDeviceLabel();
}

function adminNav(active='dashboard') {
  const items = [
    ['dashboard','admin','home','Visão geral'],
    ['stores','adminStores','store','Lojas'],
    ['reports','adminReports','chart','Relatórios'],
    ['catalog','adminCatalog','package','Catálogo'],
    ['plans','adminPlans','card','Planos'],
    ['banners','adminBanners','image','Banner']
  ];
  return `<nav class="admin-bottom-nav">${items.map(([key,go,ico,label]) => `<button class="${active===key?'active':''}" data-go="${go}">${icon(ico)}<span>${label}</span></button>`).join('')}</nav>`;
}

function adminHeader(title, subtitle='', back='admin') {
  return `<header class="admin-sub-head"><button class="back" data-go="${back}" aria-label="Voltar">${icon('arrowLeft')}</button><div><span>ADMINISTRAÇÃO</span><b>${title}</b>${subtitle ? `<small>${subtitle}</small>` : ''}</div><button class="admin-head-home" data-go="home" aria-label="Abrir aplicativo">${icon('eye')}</button></header>`;
}

function adminStatusBadge(status) {
  const map = {aprovada:['Aprovada','ok'],aguardando:['Aguardando','wait'],reprovada:['Reprovada','bad'],bloqueada:['Bloqueada','blocked']};
  const x = map[status] || [status,'wait'];
  return `<span class="admin-status ${x[1]}">${x[0]}</span>`;
}

async function admin() {
  if (!db.session.admin) return adminLogin();
  let analytics={registeredClients:0,activeVisitors30:0,whatsapp30:0,ratingAverage:null,ratingCount:0,stores:{}};
  if(window.ACCloud?.enabled){
    const [analyticsResult]=await Promise.all([
      window.ACCloud.adminAnalytics?.(),
      loadAdminBranding()
    ]);
    if(analyticsResult?.ok)analytics=analyticsResult;
  }
  const pending = db.merchants.filter(s => s.status === 'aguardando').length;
  const approved = db.merchants.filter(s => s.status === 'aprovada').length;
  const paid = db.merchants.filter(s => s.plan !== 'gratis' && s.status === 'aprovada').length;
  const activeOffers = db.offers.filter(o => o.active).length;
  const banner = db.banners.find(b => b.active);
  const bannerStore = banner ? storeById(banner.storeId) : null;
  const planMix = {
    gratis: db.merchants.filter(s=>s.plan==='gratis').length,
    premium: db.merchants.filter(s=>s.plan==='premium').length,
    premium_banner: db.merchants.filter(s=>s.plan==='premium_banner').length
  };
  const recent = db.merchants.slice().reverse().slice(0,4);
  const logoSrc=adminBranding.logoUrl||'./assets/logo-achou-comprou.png';
  const initials=String(adminBranding.name||'Administrador').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'AC';
  const avatar=adminBranding.avatarUrl
    ? `<img src="${esc(adminBranding.avatarUrl)}" alt="Foto de ${esc(adminBranding.name)}">`
    : `<span>${esc(initials)}</span>`;
  const bannerImg=adminBranding.bannerUrl?`<img class="admin-hero-bg" src="${esc(adminBranding.bannerUrl)}" alt="">`:'';

  app.innerHTML = `<main class="app-shell admin-pro ${adminDeviceClass()}">
    <header class="admin-top admin-hero ${adminBranding.bannerUrl?'has-custom-banner':''}">
      ${bannerImg}<div class="admin-hero-shade"></div>
      <div class="admin-hero-main">
        <div class="admin-brand-row">
          <img class="admin-brand-logo" src="${esc(logoSrc)}" alt="Achou, Comprou">
          <div class="admin-hero-tools">
            <span class="admin-device-chip">${icon('phone')} <b data-admin-device-label>${adminDeviceLabel()}</b></span>
            <button class="admin-settings-btn" data-go="adminSettings" aria-label="Configurações do painel">${icon('settings')}</button>
          </div>
        </div>
        <span class="admin-kicker">PAINEL ADMINISTRATIVO</span>
        <h1>Achou, <em>Comprou</em></h1>
        <p>${esc(adminBranding.subtitle||'Controle da plataforma em um só lugar.')}</p>
        <div class="admin-welcome"><span>👋</span> Bem-vindo, <b>${esc(adminBranding.name||'Administrador')}</b></div>
      </div>
      <div class="admin-profile-card">
        <div class="admin-profile-photo">${avatar}<i></i></div>
        <strong>${esc(adminBranding.name||'Administrador')}</strong>
        <small>${esc(adminBranding.role||'Administrador')}</small>
      </div>
    </header>
    <section class="admin-content">
      <div class="admin-alert ${pending ? 'show' : ''}">${icon('clock')}<div><b>${pending || 'Nenhuma'} ${pending===1?'loja aguardando':'lojas aguardando'} aprovação</b><span>${pending ? 'Revise os novos cadastros para liberar a publicação.' : 'Todos os cadastros estão em dia.'}</span></div>${pending ? '<button data-go="adminStores">Revisar</button>' : ''}</div>
      <div class="admin-kpi-grid">
        <article><span>${icon('store')}</span><small>Lojas aprovadas</small><strong>${approved}</strong><em>${db.merchants.length} cadastradas</em></article>
        <article><span>${icon('package')}</span><small>Produtos</small><strong>${db.products.length}</strong><em>${activeOffers} ofertas ativas</em></article>
        <article><span>${icon('card')}</span><small>Planos pagos</small><strong>${paid}</strong><em>${paid ? Math.round(paid/Math.max(approved,1)*100) : 0}% das aprovadas</em></article>
        <article><span>${icon('image')}</span><small>Banner principal</small><strong>${bannerStore ? 'Ativo' : '—'}</strong><em>${bannerStore ? esc(bannerStore.name) : 'Sem campanha'}</em></article>
      </div>
      <div class="admin-section-head"><div><span>RESULTADOS DO APP</span><h2>Últimos 30 dias</h2></div><button class="admin-link-btn" data-go="adminReports">Ver relatório</button></div>
      <div class="admin-result-grid">
        <article><small>Clientes cadastrados</small><strong>${analytics.registeredClients||0}</strong><span>sem contar lojistas</span></article>
        <article><small>Pessoas ativas</small><strong>${analytics.activeVisitors30||0}</strong><span>visitantes únicos</span></article>
        <article><small>Contatos WhatsApp</small><strong>${analytics.whatsapp30||0}</strong><span>cliques enviados às lojas</span></article>
        <article><small>Satisfação média</small><strong>${analytics.ratingAverage==null?'—':analytics.ratingAverage.toFixed(1)+' ★'}</strong><span>${analytics.ratingCount||0} avaliações</span></article>
      </div>
      <section class="admin-growth-card">
        <div class="admin-growth-icon">${icon('chart')}</div>
        <div><span>DESEMPENHO DA PLATAFORMA</span><h3>Os resultados do app estão <b>crescendo!</b></h3><p>Acompanhe contatos, usuários ativos e o desempenho de cada lojista.</p><button data-go="adminReports">Ver relatório completo ${icon('arrowRight')}</button></div>
        <div class="admin-growth-bars"><i></i><i></i><i></i><i></i></div>
      </section>
      <div class="admin-section-head"><div><span>ATALHOS</span><h2>Gestão rápida</h2></div></div>
      <div class="admin-quick-grid">
        <button data-go="adminStores"><span>${icon('check')}</span><b>Aprovar lojas</b><small>Cadastros e bloqueios</small>${icon('arrowRight','admin-arrow')}</button>
        <button data-go="adminPlans"><span>${icon('card')}</span><b>Planos</b><small>Ativação e solicitações</small>${icon('arrowRight','admin-arrow')}</button>
        <button data-go="adminReports"><span>${icon('chart')}</span><b>Relatórios</b><small>Resultados das lojas</small>${icon('arrowRight','admin-arrow')}</button>
        <button data-go="adminBanners"><span>${icon('image')}</span><b>Banner principal</b><small>Destaque da Home</small>${icon('arrowRight','admin-arrow')}</button>
        <button data-go="adminCatalog"><span>${icon('package')}</span><b>Produtos e ofertas</b><small>Visão geral do catálogo</small>${icon('arrowRight','admin-arrow')}</button>
      </div>
      <section class="admin-panel-card"><div class="admin-panel-head"><div><span>LOJAS</span><h3>Cadastros recentes</h3></div><button data-go="adminStores">Ver todas</button></div><div class="admin-store-list">${recent.map(m=>`<button data-admin-store="${m.id}"><span class="admin-store-avatar">${esc((m.name||'L').slice(0,2).toUpperCase())}</span><span class="admin-store-copy"><b>${esc(m.name)}</b><small>${esc(m.category)} · ${planLabel(m.plan)}</small></span>${adminStatusBadge(m.status)}</button>`).join('')}</div></section>
      <section class="admin-panel-card"><div class="admin-panel-head"><div><span>PLANOS</span><h3>Distribuição atual</h3></div><button data-go="adminPlans">Gerenciar</button></div><div class="admin-plan-bars"><div><label><span>Grátis</span><b>${planMix.gratis}</b></label><i><u style="width:${db.merchants.length?Math.max(8,planMix.gratis/db.merchants.length*100):0}%"></u></i></div><div><label><span>Premium</span><b>${planMix.premium}</b></label><i><u style="width:${db.merchants.length?Math.max(8,planMix.premium/db.merchants.length*100):0}%"></u></i></div><div><label><span>Premium + Banner</span><b>${planMix.premium_banner}</b></label><i><u style="width:${db.merchants.length?Math.max(8,planMix.premium_banner/db.merchants.length*100):0}%"></u></i></div></div></section>
      <button class="admin-logout-link" id="adminLogout">Sair da administração</button>
    </section>${adminNav('dashboard')}</main>`;
  bind();
  document.getElementById('adminLogout').onclick = async () => { if(window.ACCloud?.enabled) await window.ACCloud.signOut(); db.session.admin = false; saveDb(); profile(); };
  document.querySelectorAll('[data-admin-store]').forEach(b => b.onclick = () => adminStores(b.dataset.adminStore));
}

async function adminSettings(){
  if(!db.session.admin)return adminLogin();
  await loadAdminBranding();
  app.innerHTML=`<main class="app-shell admin-pro ${adminDeviceClass()} admin-subpage">
    ${adminHeader('Aparência do painel','Banner, logo e perfil do administrador')}
    <section class="admin-content">
      <div class="admin-branding-intro"><span>${icon('settings')}</span><div><b>Personalização do Admin</b><p>Altere a identidade visual sem precisar mexer no código.</p></div></div>
      <form class="admin-branding-form" id="adminBrandingForm">
        <div class="admin-branding-fields">
          <label>Nome exibido<input id="adminBrandName" value="${esc(adminBranding.name||'Igor')}" maxlength="60" required></label>
          <label>Função<input id="adminBrandRole" value="${esc(adminBranding.role||'Administrador')}" maxlength="60" required></label>
        </div>
        <label>Subtítulo do painel<input id="adminBrandSubtitle" value="${esc(adminBranding.subtitle||'Controle da plataforma em um só lugar.')}" maxlength="120" required></label>
        <div class="admin-section-head"><div><span>IMAGENS</span><h2>Identidade visual</h2></div></div>
        <div class="admin-branding-upload-grid">
          <div class="admin-upload-card"><label>Logo</label><input id="adminLogoInput" type="file" accept="image/jpeg,image/png,image/webp" hidden><button type="button" class="image-picker admin-logo-picker" id="adminLogoPreview"></button><button type="button" class="admin-clear-image" id="adminLogoClear">Usar logo padrão</button></div>
          <div class="admin-upload-card wide"><label>Banner do topo</label><input id="adminBannerInput" type="file" accept="image/jpeg,image/png,image/webp" hidden><button type="button" class="image-picker admin-banner-picker" id="adminBannerPreview"></button><button type="button" class="admin-clear-image" id="adminBannerClear">Remover banner</button></div>
          <div class="admin-upload-card"><label>Foto do administrador</label><input id="adminAvatarInput" type="file" accept="image/jpeg,image/png,image/webp" hidden><button type="button" class="image-picker admin-avatar-picker" id="adminAvatarPreview"></button><button type="button" class="admin-clear-image" id="adminAvatarClear">Remover foto</button></div>
        </div>
        <div id="adminBrandingMsg"></div>
        <button class="btn btn-yellow btn-block" type="submit">Salvar aparência do painel</button>
      </form>
    </section>${adminNav('dashboard')}</main>`;
  bind();

  const logoPicker=bindImagePicker('adminLogoInput','adminLogoPreview',{initial:adminBranding.logoUrl,maxW:900,maxH:500,quality:.86,emptyTitle:'Logo padrão',emptyText:'Toque para trocar'});
  const bannerPicker=bindImagePicker('adminBannerInput','adminBannerPreview',{initial:adminBranding.bannerUrl,maxW:1800,maxH:900,quality:.84,emptyTitle:'Adicionar banner',emptyText:'Recomendado: imagem horizontal'});
  const avatarPicker=bindImagePicker('adminAvatarInput','adminAvatarPreview',{initial:adminBranding.avatarUrl,maxW:700,maxH:700,quality:.84,emptyTitle:'Adicionar foto',emptyText:'Foto quadrada funciona melhor'});

  document.getElementById('adminLogoClear').onclick=()=>logoPicker.set('');
  document.getElementById('adminBannerClear').onclick=()=>bannerPicker.set('');
  document.getElementById('adminAvatarClear').onclick=()=>avatarPicker.set('');

  document.getElementById('adminBrandingForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('adminBrandingMsg');
    const payload={
      name:document.getElementById('adminBrandName').value.trim(),
      role:document.getElementById('adminBrandRole').value.trim(),
      subtitle:document.getElementById('adminBrandSubtitle').value.trim(),
      logoData:logoPicker.get(),
      bannerData:bannerPicker.get(),
      avatarData:avatarPicker.get()
    };
    msg.innerHTML='<div class="notice">Salvando aparência...</div>';
    if(window.ACCloud?.enabled){
      const result=await window.ACCloud.saveAdminBranding(payload);
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível salvar.')}</div>`;return;}
      adminBranding={...adminBranding,...result.config};
    }else{
      adminBranding={...adminBranding,name:payload.name,role:payload.role,subtitle:payload.subtitle,logoUrl:payload.logoData,bannerUrl:payload.bannerData,avatarUrl:payload.avatarData};
    }
    msg.innerHTML='<div class="notice success">Aparência salva com sucesso.</div>';
    setTimeout(admin,500);
  };
}

async function adminReports(){
  if(!db.session.admin)return adminLogin();
  let analytics={registeredClients:0,activeVisitors30:0,appOpens30:0,whatsapp30:0,whatsappAll:0,ratingAverage:null,ratingCount:0,stores:{}};
  if(window.ACCloud?.enabled){
    const result=await window.ACCloud.adminAnalytics?.();
    if(result?.ok)analytics=result;
  }
  const rows=db.merchants.filter(m=>m.status==='aprovada').map(m=>{
    const s=analytics.stores?.[m.id]||{};
    const top=Object.entries(s.productContacts||{}).sort((a,b)=>b[1]-a[1])[0];
    const p=top?db.products.find(x=>x.id===top[0]):null;
    return {m,s,topProduct:p?.name||'',topContacts:top?.[1]||0};
  }).sort((a,b)=>(b.s.whatsapp30||0)-(a.s.whatsapp30||0)||(b.s.productViews30||0)-(a.s.productViews30||0));
  app.innerHTML=`<main class="app-shell admin-pro ${adminDeviceClass()} admin-subpage">${adminHeader('Relatórios e resultados','Desempenho real do Achou, Comprou')}
    <section class="admin-content">
      <div class="admin-summary-strip four"><div><small>Clientes</small><strong>${analytics.registeredClients||0}</strong></div><div><small>Ativos 30d</small><strong>${analytics.activeVisitors30||0}</strong></div><div><small>WhatsApp 30d</small><strong>${analytics.whatsapp30||0}</strong></div><div><small>Satisfação</small><strong>${analytics.ratingAverage==null?'—':analytics.ratingAverage.toFixed(1)+'★'}</strong></div></div>
      <div class="admin-section-head"><div><span>DESEMPENHO DAS LOJAS</span><h2>Resultados dos últimos 30 dias</h2></div></div>
      <div class="admin-report-list">${rows.length?rows.map((x,i)=>`<article class="admin-report-card"><div class="admin-report-rank">${i+1}</div><div class="admin-report-main"><div class="admin-report-title"><div><b>${esc(x.m.name)}</b><small>${esc(x.m.category||'Loja local')}</small></div><span>${x.s.ratingAverage==null?'Sem avaliações':x.s.ratingAverage.toFixed(1)+' ★ · '+(x.s.ratingCount||0)}</span></div><div class="admin-report-metrics"><div><strong>${x.s.whatsapp30||0}</strong><small>Contatos WhatsApp</small></div><div><strong>${x.s.uniqueVisitors30||0}</strong><small>Pessoas alcançadas</small></div><div><strong>${x.s.productViews30||0}</strong><small>Produtos vistos</small></div><div><strong>${x.s.storeViews30||0}</strong><small>Visitas à loja</small></div></div>${x.topProduct?`<div class="admin-report-highlight">${icon('chat')} Produto com mais interesse: <b>${esc(x.topProduct)}</b> · ${x.topContacts} contato(s)</div>`:''}</div></article>`).join(''):'<div class="notice">Ainda não há lojas aprovadas com dados para o relatório.</div>'}</div>
      <section class="admin-panel-card"><div class="admin-panel-head"><div><span>PLATAFORMA</span><h3>Leitura geral</h3></div></div><div class="admin-report-overview"><p><b>${analytics.appOpens30||0}</b> aberturas registradas nos últimos 30 dias.</p><p><b>${analytics.whatsappAll||0}</b> contatos de WhatsApp registrados desde o início.</p><p><b>${analytics.ratingCount||0}</b> avaliações de satisfação registradas.</p></div></section>
    </section>${adminNav('reports')}</main>`;
  bind();
}

async function adminStores(focusId='') {
  if (!db.session.admin) return adminLogin();
  let analytics={stores:{}};
  if(window.ACCloud?.enabled){
    const result=await window.ACCloud.adminAnalytics?.();
    if(result?.ok)analytics=result;
  }
  const counts = {all:db.merchants.length, pending:db.merchants.filter(x=>x.status==='aguardando').length, approved:db.merchants.filter(x=>x.status==='aprovada').length, blocked:db.merchants.filter(x=>x.status==='bloqueada').length};
  app.innerHTML = `<main class="app-shell admin-pro ${adminDeviceClass()} admin-subpage">${adminHeader('Lojas cadastradas','Aprovação, satisfação e resultados')}<section class="admin-content"><div class="admin-summary-strip"><div><small>Total</small><strong>${counts.all}</strong></div><div><small>Aguardando</small><strong>${counts.pending}</strong></div><div><small>Aprovadas</small><strong>${counts.approved}</strong></div><div><small>Bloqueadas</small><strong>${counts.blocked}</strong></div></div><div class="admin-filter-row"><button class="active" data-store-filter="todos">Todas</button><button data-store-filter="aguardando">Aguardando</button><button data-store-filter="aprovada">Aprovadas</button><button data-store-filter="bloqueada">Bloqueadas</button></div><div class="admin-store-management" id="adminStoreList">${db.merchants.map(store=>adminStoreCard(store,focusId,analytics.stores?.[store.id]||{})).join('')}</div></section>${adminNav('stores')}</main>`;
  bind();
  bindAdminStoreActions();
  document.querySelectorAll('[data-store-filter]').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('[data-store-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
    const f=btn.dataset.storeFilter; document.querySelectorAll('[data-admin-status]').forEach(card=>card.style.display=(f==='todos'||card.dataset.adminStatus===f)?'grid':'none');
  });
  if (focusId) setTimeout(()=>document.querySelector(`[data-store-card="${focusId}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),30);
}

function adminStoreCard(store, focusId='', results={}) {
  const satisfaction=results.ratingAverage==null?(store.rating&&store.rating!=='Novo'?store.rating+' ★':'Sem avaliações'):`${Number(results.ratingAverage).toFixed(1)} ★`;
  return `<article class="admin-store-card ${focusId===store.id?'focus':''}" data-store-card="${store.id}" data-admin-status="${store.status}"><div class="admin-store-card-top"><span class="admin-store-avatar large">${esc((store.name||'L').slice(0,2).toUpperCase())}</span><div><div class="admin-store-name-row"><h3>${esc(store.name)}</h3>${adminStatusBadge(store.status)}</div><p>${esc(store.category)} · ${esc(store.address || 'Grajaú - MA')}</p><small>${esc(store.email)}</small></div></div><div class="admin-store-meta results"><div><small>Plano</small><b>${planLabel(store.plan)}</b></div><div><small>Satisfação</small><b>${satisfaction}</b></div><div><small>WhatsApp 30d</small><b>${results.whatsapp30||0}</b></div><div><small>Pessoas 30d</small><b>${results.uniqueVisitors30||0}</b></div></div><div class="admin-store-actions">${store.status==='aguardando'?`<button class="primary" data-approve="${store.id}">${icon('check')} Aprovar</button><button data-reject="${store.id}">Reprovar</button>`:''}${store.status==='aprovada'?`<button data-block="${store.id}">Bloquear loja</button><button data-view-store="${store.id}">${icon('eye')} Ver no app</button>`:''}${store.status==='bloqueada'?`<button class="primary" data-reactivate="${store.id}">Reativar</button>`:''}${store.status==='reprovada'?`<button class="primary" data-reactivate="${store.id}">Aprovar agora</button>`:''}</div></article>`;
}

function bindAdminStoreActions(){
  const changeStatus=async(id,status,button)=>{const m=storeById(id);if(!m)return;if(window.ACCloud?.enabled){button.disabled=true;const result=await window.ACCloud.updateStoreAdmin(id,{status});button.disabled=false;if(!result.ok){alert(result.message||'Não foi possível alterar a loja.');return;}Object.assign(m,window.ACCloud.localStore(result.store));}else m.status=status;saveDb();syncPublicStoreState();adminStores(m.id);};
  document.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.approve,'aprovada',b));
  document.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.reject,'reprovada',b));
  document.querySelectorAll('[data-block]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.block,'bloqueada',b));
  document.querySelectorAll('[data-reactivate]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.reactivate,'aprovada',b));
  document.querySelectorAll('[data-view-store]').forEach(b=>b.onclick=()=>store(b.dataset.viewStore));
}

async function adminPlans() {
  if (!db.session.admin) return adminLogin();
  if(window.ACCloud?.enabled){
    await syncAdminPayments();
    await syncCloudAdminData();
  }
  const payments=db.payments||[];
  const config=db.paymentConfig||{};
  const review=payments.filter(p=>['em_analise','aguardando'].includes(p.status));
  const monthStart=new Date();monthStart.setDate(1);monthStart.setHours(0,0,0,0);
  const monthPaid=payments.filter(p=>p.status==='pago'&&p.method==='pix'&&new Date(p.confirmedAt||p.paidAt||0)>=monthStart);
  const received=monthPaid.reduce((sum,p)=>sum+Number(p.value||0),0);
  const paidStores=db.merchants.filter(m=>m.status==='aprovada'&&m.plan!=='gratis');
  const expiring=paidStores.filter(m=>m.planExpiresAt&&new Date(m.planExpiresAt).getTime()-Date.now()<=7*86400000).length;

  app.innerHTML=`<main class="app-shell admin-pro ${adminDeviceClass()} admin-subpage">
    ${adminHeader('Assinaturas e pagamentos','PIX manual com confirmação do administrador')}
    <section class="admin-content">
      <div class="admin-summary-strip three payment-summary">
        <div><small>Recebido no mês</small><strong>${brlNumber(received)}</strong></div>
        <div><small>Aguardando análise</small><strong>${review.filter(p=>p.status==='em_analise').length}</strong></div>
        <div><small>Planos pagos ativos</small><strong>${paidStores.length}</strong></div>
      </div>
      ${expiring?`<div class="admin-alert show">${icon('clock')}<div><b>${expiring} ${expiring===1?'assinatura vence':'assinaturas vencem'} em até 7 dias</b><span>Confira as renovações para evitar perda dos benefícios.</span></div></div>`:''}

      <form class="admin-form-card pix-admin-card" id="pixConfigForm">
        <div class="admin-form-heading"><span>${icon('card')}</span><div><b>Configuração do PIX</b><small>A chave fica visível apenas no pagamento e o QR Code é gerado automaticamente com o valor do plano.</small></div></div>
        <label>Chave PIX<input id="adminPixKey" value="${esc(config.pixKey||'')}" placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"></label>
        <div class="two-cols"><label>Nome do beneficiário<input id="adminPixName" value="${esc(config.pixName||'')}" placeholder="Nome que aparece no PIX"></label><label>Cidade<input id="adminPixCity" value="${esc(config.pixCity||'Grajaú - MA')}" placeholder="Grajaú - MA"></label></div>
        <label>Instrução<textarea id="adminPixInstruction" placeholder="Orientação para o lojista">${esc(config.instruction||'Após fazer o PIX, envie o comprovante para análise.')}</textarea></label>
        <button class="btn btn-yellow" type="submit">Salvar configuração do PIX</button><div id="pixConfigMsg"></div>
      </form>

      <div class="admin-section-head"><div><span>PAGAMENTOS</span><h2>Para conferir</h2></div><span>${review.length} solicitação(ões)</span></div>
      <div class="admin-payment-list">
        ${review.length?review.map(p=>{const store=storeById(p.storeId);return `<article class="admin-payment-card">
          <div class="admin-payment-main"><span class="admin-store-avatar">${esc((store?.name||'L').slice(0,2).toUpperCase())}</span><div><small>${formatDateBR(p.requestedAt)}</small><b>${esc(store?.name||'Loja')}</b><span>${planLabel(p.plan)} · ${brlNumber(p.value)}</span></div><span class="admin-status ${paymentStatusClass(p.status)}">${paymentStatusLabel(p.status)}</span></div>
          ${p.proofPath?`<button class="payment-proof-link" data-proof-payment="${p.id}">${icon('eye')} Ver comprovante</button>`:'<div class="payment-no-proof">Comprovante ainda não enviado.</div>'}
          <label class="payment-note-label">Observação (opcional)<input data-payment-note="${p.id}" placeholder="Ex.: PIX conferido no extrato"></label>
          <div class="admin-payment-actions"><button class="btn btn-yellow" data-confirm-payment="${p.id}" type="button">${icon('check')} Confirmar pagamento</button><button class="btn btn-secondary" data-reject-payment="${p.id}" type="button">Recusar</button></div>
        </article>`}).join(''):'<div class="admin-empty">Nenhum pagamento aguardando conferência.</div>'}
      </div>

      <div class="admin-section-head"><div><span>ASSINATURAS</span><h2>Controle das lojas</h2></div></div>
      <div class="admin-subscription-control">
        ${db.merchants.filter(m=>m.status==='aprovada').map(store=>`<article class="subscription-control-card">
          <div class="subscription-store"><span class="admin-store-avatar">${esc((store.name||'L').slice(0,2).toUpperCase())}</span><div><b>${esc(store.name)}</b><small>${store.requestedPlan?`Solicitou ${planLabel(store.requestedPlan)}`:'Sem solicitação pendente'}</small></div></div>
          <div class="subscription-current"><small>PLANO ATUAL</small><strong>${planLabel(store.plan)}</strong><span>${store.plan!=='gratis'&&store.planExpiresAt?`Vence em ${formatDateBR(store.planExpiresAt)}`:'Sem vencimento de plano pago'}</span></div>
          <div class="subscription-manual"><select data-manual-plan="${store.id}"><option value="premium">Premium · R$ 49,90</option><option value="premium_banner" ${store.requestedPlan==='premium_banner'?'selected':''}>Premium + Banner · R$ 59,90</option></select><button class="btn btn-secondary" data-manual-activate="${store.id}" type="button">Ativar 30 dias manualmente</button>${store.plan!=='gratis'?`<button class="danger subscription-downgrade" data-downgrade-store="${store.id}" type="button">Voltar ao Grátis</button>`:''}</div>
        </article>`).join('')||'<div class="admin-empty">Nenhuma loja aprovada.</div>'}
      </div>

      <div class="admin-section-head"><div><span>HISTÓRICO</span><h2>Pagamentos recentes</h2></div></div>
      <div class="admin-payment-history">
        ${payments.length?payments.slice(0,20).map(p=>{const store=storeById(p.storeId);return `<article><div><b>${esc(store?.name||'Loja')}</b><small>${formatDateBR(p.requestedAt)} · ${planLabel(p.plan)} · ${p.method==='cortesia'?'Ativação manual':brlNumber(p.value)}</small></div><span class="admin-status ${paymentStatusClass(p.status)}">${paymentStatusLabel(p.status)}</span></article>`}).join(''):'<div class="admin-empty">Ainda não há pagamentos registrados.</div>'}
      </div>
    </section>
    ${adminNav('plans')}
  </main>`;
  bind();

  document.getElementById('pixConfigForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('pixConfigMsg');
    const payload={pixKey:document.getElementById('adminPixKey').value.trim(),pixName:document.getElementById('adminPixName').value.trim(),pixCity:document.getElementById('adminPixCity').value.trim(),instruction:document.getElementById('adminPixInstruction').value.trim()};
    if(!payload.pixKey){msg.innerHTML='<div class="notice error">Informe a chave PIX que será usada para receber os planos.</div>';return;}
    if(window.ACCloud?.enabled){
      const result=await window.ACCloud.savePaymentConfig(payload);
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível salvar a configuração.')}</div>`;return;}
    }
    db.paymentConfig=payload;saveDb();msg.innerHTML='<div class="notice success">Configuração do PIX salva.</div>';
  };

  document.querySelectorAll('[data-proof-payment]').forEach(btn=>btn.onclick=async()=>{
    const p=paymentById(btn.dataset.proofPayment);if(!p?.proofPath)return;
    if(window.ACCloud?.enabled){
      btn.disabled=true;const result=await window.ACCloud.paymentProofUrl(p.proofPath);btn.disabled=false;
      if(!result.ok||!result.url){alert(result.message||'Não foi possível abrir o comprovante.');return;}
      window.open(result.url,'_blank');return;
    }
  });

  document.querySelectorAll('[data-confirm-payment]').forEach(btn=>btn.onclick=async()=>{
    const id=btn.dataset.confirmPayment;const note=document.querySelector(`[data-payment-note="${id}"]`)?.value.trim()||'';
    if(window.ACCloud?.enabled){
      btn.disabled=true;const result=await window.ACCloud.confirmPayment(id,note);btn.disabled=false;
      if(!result.ok){alert(result.message||'Não foi possível confirmar o pagamento.');return;}
      await syncAdminPayments();await syncCloudAdminData();adminPlans();return;
    }
    const p=paymentById(id);if(p){p.status='pago';p.confirmedAt=new Date().toISOString();const m=storeById(p.storeId);if(m){m.plan=p.plan;m.planExpiresAt=new Date(Date.now()+30*86400000).toISOString();m.requestedPlan=null;}saveDb();adminPlans();}
  });

  document.querySelectorAll('[data-reject-payment]').forEach(btn=>btn.onclick=async()=>{
    const id=btn.dataset.rejectPayment;const note=document.querySelector(`[data-payment-note="${id}"]`)?.value.trim()||'Comprovante não confirmado.';
    if(window.ACCloud?.enabled){
      btn.disabled=true;const result=await window.ACCloud.rejectPayment(id,note);btn.disabled=false;
      if(!result.ok){alert(result.message||'Não foi possível recusar o pagamento.');return;}
      await syncAdminPayments();adminPlans();return;
    }
    const p=paymentById(id);if(p){p.status='recusado';p.note=note;saveDb();adminPlans();}
  });

  document.querySelectorAll('[data-manual-activate]').forEach(btn=>btn.onclick=async()=>{
    const storeId=btn.dataset.manualActivate;
    const plan=document.querySelector(`[data-manual-plan="${storeId}"]`)?.value||'premium';
    if(window.ACCloud?.enabled){
      btn.disabled=true;const result=await window.ACCloud.activatePlanManual(storeId,plan,30,'Ativação manual de 30 dias pelo administrador');btn.disabled=false;
      if(!result.ok){alert(result.message||'Não foi possível ativar o plano.');return;}
      await syncAdminPayments();await syncCloudAdminData();adminPlans();return;
    }
  });

  document.querySelectorAll('[data-downgrade-store]').forEach(btn=>btn.onclick=async()=>{
    const storeId=btn.dataset.downgradeStore;
    if(window.ACCloud?.enabled){
      btn.disabled=true;const result=await window.ACCloud.downgradeStore(storeId);btn.disabled=false;
      if(!result.ok){alert(result.message||'Não foi possível alterar o plano.');return;}
      await syncCloudAdminData();adminPlans();return;
    }
    const m=storeById(storeId);if(m){m.plan='gratis';m.planExpiresAt='';m.requestedPlan=null;saveDb();adminPlans();}
  });
}

function adminBanners() {
  if (!db.session.admin) return adminLogin();
  const eligible = db.merchants.filter(m=>m.status==='aprovada'&&m.plan==='premium_banner');
  const eligibleIds=new Set(eligible.map(m=>m.id));
  const activeBanners=(db.banners||[]).filter(b=>b.active&&eligibleIds.has(b.storeId));
  app.innerHTML = `<main class="app-shell admin-pro ${adminDeviceClass()} admin-subpage">
    ${adminHeader('Banners da Home','Carrossel Premium + Banner')}
    <section class="admin-content">
      <div class="admin-summary-strip three">
        <div><small>Lojas elegíveis</small><strong>${eligible.length}</strong></div>
        <div><small>Banners ativos</small><strong>${activeBanners.length}</strong></div>
        <div><small>Rotação</small><strong>4,8s</strong></div>
      </div>

      <div class="admin-banner-preview carousel-mode">
        <span>COMO APARECE NA HOME</span>
        <div><small>Premium + Banner</small><h2>Banners em movimento</h2><p>As lojas ativas passam automaticamente e também podem ser arrastadas para o lado.</p></div>
      </div>

      <form class="admin-form-card" id="bannerForm">
        <div class="admin-form-heading"><span>${icon('image')}</span><div><b>Novo destaque</b><small>Somente lojas aprovadas no Premium + Banner.</small></div></div>
        ${eligible.length?`
          <label>Loja<select id="bannerStore">${eligible.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label>
          <label>Título<input id="bannerTitle" maxlength="60" value="Oferta especial perto de você"></label>
          <label>Mensagem<input id="bannerMessage" maxlength="100" value="Veja as novidades desta loja no Achou, Comprou."></label>
          <div class="product-media-field">
            <label class="media-label">Arte do banner (opcional)</label>
            <input class="media-file-input" id="bannerImageFile" type="file" accept="image/jpeg,image/png,image/webp">
            <button class="media-picker cover admin-banner-image-picker" type="button" id="bannerImagePreview"></button>
            <small>Se não enviar uma arte, o sistema usa a identidade visual da loja.</small>
          </div>
          <label>Exibir até (opcional)<input id="bannerEndDate" type="date"></label>
          <div class="admin-form-actions"><button class="btn btn-yellow" type="submit">Adicionar ao carrossel</button></div>
          <div id="bannerMsg"></div>
        `:'<div class="admin-empty">Nenhuma loja aprovada está no plano Premium + Banner.</div>'}
      </form>

      <div class="admin-section-head"><div><span>CARROSSEL ATIVO</span><h2>Destaques publicados</h2></div></div>
      <div class="admin-banner-list">
        ${activeBanners.length?activeBanners.map(b=>{const m=storeById(b.storeId);return `
          <article class="admin-banner-item">
            <div class="admin-banner-thumb">${b.imageData?`<img src="${esc(b.imageData)}" alt="">`:`<span>${esc((m?.name||'A').slice(0,2).toUpperCase())}</span>`}</div>
            <div><small>${esc(m?.name||'Loja')}</small><b>${esc(b.title||'Destaque')}</b><span>${b.end?`Até ${new Date(b.end).toLocaleDateString('pt-BR')}`:'Sem data final'}</span></div>
            <button class="btn btn-secondary admin-banner-remove" type="button" data-disable-banner="${b.id}">Retirar</button>
          </article>`;
        }).join(''):'<div class="admin-empty">Nenhum banner ativo. A Home mostra o destaque padrão.</div>'}
      </div>
    </section>
    ${adminNav('banners')}
  </main>`;
  bind();
  if (!eligible.length) return;

  const bannerImagePicker=bindImagePicker('bannerImageFile','bannerImagePreview',{maxW:1400,maxH:700,quality:.82,emptyTitle:'Adicionar arte',emptyText:'Imagem horizontal'});

  document.getElementById('bannerForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('bannerMsg');
    const submit=e.currentTarget.querySelector('button[type="submit"]');
    const payload={
      storeId:document.getElementById('bannerStore').value,
      title:document.getElementById('bannerTitle').value.trim(),
      message:document.getElementById('bannerMessage').value.trim(),
      imageData:bannerImagePicker.get(),
      endDate:document.getElementById('bannerEndDate').value
    };
    if(!payload.title){msg.innerHTML='<div class="notice error">Informe um título para o banner.</div>';return;}

    if(window.ACCloud?.enabled){
      submit.disabled=true;msg.innerHTML='<div class="notice">Publicando no carrossel...</div>';
      const result=await window.ACCloud.publishBanner(payload);
      submit.disabled=false;
      if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível publicar o banner.')}</div>`;return;}
      db.banners.forEach(b=>{if(b.storeId===payload.storeId)b.active=false;});
      db.banners.push(result.banner);
    }else{
      db.banners.forEach(b=>{if(b.storeId===payload.storeId)b.active=false;});
      db.banners.push({id:id('banner'),...payload,active:true,start:new Date().toISOString(),end:payload.endDate?`${payload.endDate}T23:59:59`:'',createdAt:new Date().toISOString()});
    }
    saveDb();
    adminBanners();
  };

  document.querySelectorAll('[data-disable-banner]').forEach(btn=>btn.onclick=async()=>{
    const bannerId=btn.dataset.disableBanner;
    if(window.ACCloud?.enabled){
      btn.disabled=true;
      const result=await window.ACCloud.setBannerActive(bannerId,false);
      if(!result.ok){btn.disabled=false;alert(result.message||'Não foi possível retirar o banner.');return;}
    }
    const local=(db.banners||[]).find(b=>b.id===bannerId);
    if(local)local.active=false;
    saveDb();
    adminBanners();
  });
}

function adminCatalog() {
  if (!db.session.admin) return adminLogin();
  const activeProducts=db.products.filter(p=>p.status==='ativo').length;
  const activeOffers=db.offers.filter(o=>o.active).length;
  app.innerHTML=`<main class="app-shell admin-pro ${adminDeviceClass()} admin-subpage">${adminHeader('Produtos e ofertas','Visão geral do catálogo')}<section class="admin-content"><div class="admin-summary-strip three"><div><small>Produtos</small><strong>${db.products.length}</strong></div><div><small>Ativos</small><strong>${activeProducts}</strong></div><div><small>Ofertas</small><strong>${activeOffers}</strong></div></div><div class="admin-section-head"><div><span>CATÁLOGO</span><h2>Produtos cadastrados</h2></div></div><div class="admin-catalog-list">${db.products.map(p=>{const m=storeById(p.storeId);const off=activeOfferFor(p.id);return `<article><div class="admin-catalog-thumb">${productMedia(p,true)}</div><div><small>${esc(m?.name||'Loja')}</small><b>${esc(p.name)}</b><span>${esc(p.type)} · ${p.status==='ativo'?'Publicado':'Pausado'}</span></div><div class="admin-catalog-price"><strong>${money(off?.promo||p.promo||p.price)}</strong>${off?'<small>Oferta ativa</small>':''}</div></article>`}).join('')||'<div class="admin-empty">Nenhum produto cadastrado.</div>'}</div><div class="admin-section-head"><div><span>OFERTAS</span><h2>Campanhas ativas</h2></div></div><div class="admin-offer-audit">${db.offers.map(o=>{const p=db.products.find(x=>x.id===o.productId);const m=storeById(o.storeId);return `<article><div><b>${esc(p?.name||'Produto')}</b><small>${esc(m?.name||'Loja')} · validade ${o.validUntil||'não informada'}</small></div><strong>${money(o.promo)}</strong><span class="admin-status ${o.active?'ok':'wait'}">${o.active?'Ativa':'Pausada'}</span></article>`}).join('')||'<div class="admin-empty">Nenhuma oferta cadastrada.</div>'}</div></section>${adminNav('catalog')}</main>`;
  bind();
}
function bind() {
  applyAdminDeviceMode();
  applyMerchantDeviceMode();
  document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => {
    const go = el.dataset.go;
    ({ home, search, product, store, profile, categories, clientLogin, clientRegister, clientEditProfile, clientForgot, recentSearches, notifications, clientSettings, passwordResetConfirm, merchantLogin, merchantRegister, merchantPlanOnboarding, merchantSubmitted, plansPreview, merchant, merchantProducts, merchantOffers, merchantStore, productForm, offerForm, stats, plans, adminLogin, admin, adminStores, adminPlans, adminBanners, adminCatalog, adminReports, adminSettings, fav: favorites }[go] || home)();
  });
  document.querySelectorAll('[data-product-id]').forEach(el => el.onclick = () => product(el.dataset.productId));
  document.querySelectorAll('[data-store-id]').forEach(el => el.onclick = () => store(el.dataset.storeId));
  document.querySelectorAll('[data-search-term]').forEach(el => el.onclick = () => search(el.dataset.searchTerm || ''));
  document.querySelectorAll('[data-password-toggle]').forEach(btn=>{
    btn.onclick=()=>{
      const input=document.getElementById(btn.dataset.passwordToggle);
      if(!input)return;
      const showing=input.type==='text';
      input.type=showing?'password':'text';
      btn.classList.toggle('showing',!showing);
      btn.setAttribute('aria-label',showing?'Mostrar senha':'Ocultar senha');
      btn.title=showing?'Mostrar senha':'Ocultar senha';
    };
  });
}

async function bootstrapCloudSession(){
  if(!window.ACCloud?.enabled)return;
  window.ACCloud.trackAppOpen?.().catch(()=>{});
  await syncCloudPublicCatalog();

  const session=await window.ACCloud.getSession();
  if(!session?.user){
    db.session.clientId=null;
    db.session.merchantId=null;
    db.session.admin=false;
    saveDb();
    return;
  }

  const user=session.user;
  const profile=await window.ACCloud.getProfile(user.id);

  // O modo salvo no navegador define qual área o usuário escolheu.
  if(db.session.admin){
    const adminAllowed=await window.ACCloud.isCurrentUserAdmin?.();
    if(adminAllowed){
      db.session.clientId=null;
      db.session.merchantId=null;
      await syncCloudAdminData();
      await syncAdminPayments();
      saveDb();
      return;
    }
    db.session.admin=false;
  }

  const store=await window.ACCloud.getMerchantStore(user.id);

  if(db.session.merchantId && store){
    db.session.admin=false;
    db.session.clientId=null;
    db.session.merchantId=store.id;
    upsertCloudMerchant(store,user);
    await syncCloudMerchantCatalog(store.id);
    saveDb();
    return;
  }

  // Todo usuário comum também pode usar o lado cliente,
  // mesmo que possua uma loja vinculada.
  db.session.admin=false;
  db.session.merchantId=null;
  db.session.clientId=user.id;
  upsertCloudClient(profile,user);
  await syncCloudFavorites(user.id);
  saveDb();
}

let adminDeviceResizeTimer=0;
window.addEventListener('resize',()=>{
  clearTimeout(adminDeviceResizeTimer);
  adminDeviceResizeTimer=setTimeout(()=>{
    applyAdminDeviceMode();
    applyMerchantDeviceMode();
  },120);
});
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
if(window.ACCloud?.enabled){
  window.ACCloud.onAuthChange?.((event)=>{
    if(event==='PASSWORD_RECOVERY') passwordResetConfirm();
  });
}
bootstrapCloudSession().finally(()=>{
  if(publicState.passwordRecovery)return;
  if(db.session.admin){admin();return;}
  if(db.session.merchantId){merchant();return;}
  splash();
});
