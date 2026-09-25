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
function loadDb() { try { const raw = localStorage.getItem(DB_KEY) || localStorage.getItem('achou_comprou_mvp_v16'); const saved = JSON.parse(raw); if (saved && saved.merchants && saved.products && saved.offers) { saved.clients = Array.isArray(saved.clients) ? saved.clients.map(c => ({...c, favorites:Array.isArray(c.favorites)?c.favorites:[], phone:c.phone||'', city:c.city||'Grajaú - MA'})) : []; saved.merchants = Array.isArray(saved.merchants) ? saved.merchants.map(m => ({...m, logoData:m.logoData||'', coverData:m.coverData||''})) : []; saved.products = Array.isArray(saved.products) ? saved.products.map(p => ({...p, imageData:p.imageData||''})) : []; saved.recentSearches = Array.isArray(saved.recentSearches) ? saved.recentSearches : []; saved.notifications = Array.isArray(saved.notifications) ? saved.notifications : []; saved.clientSettings = saved.clientSettings || { offers:true, favorites:true, local:true }; saved.session = saved.session || {}; saved.session.clientId = saved.session.clientId || null; saved.session.merchantId = saved.session.merchantId || null; saved.session.admin = !!saved.session.admin; return saved; } } catch (_) {} return clone(DEFAULT_DB); }
let db = loadDb();
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
    description:store.descricao||'', email:user.email||'', password:'', status:store.status||'aguardando',
    plan:store.plano_id||'gratis', requestedPlan:store.plano_solicitado||null,
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
async function finishClientAccess(clientId) { db.session.clientId=clientId; await syncCloudFavorites(clientId); const pending=publicState.afterLogin; if(pending?.favoriteId) await setFavorite(pending.favoriteId,true); publicState.afterLogin=null; saveDb(); if(pending?.screen==='product' && pending.productId) return product(pending.productId); if(pending?.screen==='favorites') return favorites(); profile(); }
function id(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2,8)}`; }
function esc(value='') { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function planLabel(plan) { return ({gratis:'Grátis', premium:'Premium', premium_banner:'Premium + Banner'})[plan] || 'Grátis'; }
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

const publicState = { productId: 'p1', storeId: 'loja-maranhao', query: '', merchantPlanIntent:'', merchantDraft:null, afterLogin:null, passwordRecovery:false, filters: { category:'', option:'', color:'', maxPrice:'' } };

function normalizeText(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
function storePriority(plan) { return ({ premium_banner: 3, premium: 2, gratis: 1 })[plan] || 0; }
function approvedStores() { return db.merchants.filter(m => m.status === 'aprovada').sort((a,b) => storePriority(b.plan) - storePriority(a.plan)); }
function storeById(id) { return db.merchants.find(m => m.id === id) || null; }
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
  return publicProducts().map(p => ({ product: p, offer: activeOfferFor(p.id), store: storeById(p.storeId) })).filter(x => x.offer && x.store).sort((a,b) => storePriority(b.store.plan) - storePriority(a.store.plan));
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
  }).sort((a,b) => productSearchScore(b,query,intent)-productSearchScore(a,query,intent));
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
  const opts = detailed ? [...new Set(live.map(v=>v.option).filter(Boolean))] : (p.type === 'calcado' ? meta.numbers : meta.sizes);
  const colors = detailed ? [...new Set(live.map(v=>v.color).filter(Boolean))] : meta.colors;
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
  const msg = encodeURIComponent(`Olá, vi ${product?.name || 'um produto'} no Achou, Comprou e tenho interesse. Ainda está disponível?`);
  return `https://wa.me/${phone}?text=${msg}`;
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

function nav(active = 'home') {
  return `<nav class="bottom-nav">
    <button class="nav-item ${active === 'home' ? 'active' : ''}" data-go="home">${icon('home')}<span>Início</span></button>
    <button class="nav-item ${active === 'search' ? 'active' : ''}" data-go="search">${icon('search')}<span>Buscar</span></button>
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
  const activeBanner = db.banners.find(b => b.active);
  const bannerStore = activeBanner ? storeById(activeBanner.storeId) : approvedStores()[0] || null;
  const offers = publicOffers();
  const shops = approvedStores();
  const client = currentClient();
  const unreadNotifications = (db.notifications || []).filter(n => !n.read).length;
  const cats = [
    ['shirt', 'Moda', 'moda'], ['bag', 'Calçados', 'calcado'], ['food', 'Alimentação', 'alimentacao'], ['beauty', 'Beleza', 'beleza'], ['health', 'Saúde', 'saude'],
    ['home', 'Casa', 'casa'], ['phone', 'Tecnologia', 'tecnologia'], ['car', 'Automotivo', 'automotivo'], ['tools', 'Serviços', 'servicos'], ['grid', 'Ver todas', '']
  ];
  app.innerHTML = `<main class="app-shell home-professional">
    <header class="topbar home-topbar">
      <div class="brand-row home-brand-row">
        ${logo()}
        <div class="home-head-actions">
          <button class="location-button">${icon('pin')}<span>Grajaú - MA</span><span class="chevron">⌄</span></button>
          <button class="round-action" data-go="notifications" aria-label="Notificações">${icon('bell')}${unreadNotifications ? '<span class="notification-dot" aria-hidden="true"></span>' : ''}</button>
          <button class="round-action home-profile-action ${client?.avatar ? 'has-photo' : ''}" data-go="profile" aria-label="Meu perfil">${client?.avatar ? `<img src="${esc(client.avatar)}" alt="Foto de perfil">` : icon('user')}</button>
        </div>
      </div>
      <div class="search home-search"><span class="search-leading">${icon('search')}</span><input id="q" placeholder="O que você está procurando?"><button id="searchBtn" aria-label="Filtros">${icon('sliders')}</button></div>
      <button class="quick-query" data-search-term="tênis infantil número 28"><span>Busca rápida</span> Tênis infantil nº 28 ${icon('arrowRight')}</button>
    </header>

    <section class="content home-content">
      <div class="home-section-head"><div><span>CATEGORIAS</span><h3>O que você procura hoje?</h3></div><button data-go="categories">Ver todas</button></div>
      <div class="cats cats-pro">${cats.map(([i, t, term]) => t === 'Ver todas' ? `<button class="cat" data-go="categories"><i>${icon(i)}</i><span>${t}</span></button>` : `<button class="cat" data-search-term="${term}"><i>${icon(i)}</i><span>${t}</span></button>`).join('')}</div>

      <div class="banner banner-pro" ${bannerStore ? `data-store-id="${bannerStore.id}"` : ''}>
        <div class="banner-copy"><span class="banner-label">DESTAQUE DA CIDADE</span><small>${bannerStore ? esc(bannerStore.name) : 'Comércio local'}</small><h2>${activeBanner ? esc(activeBanner.title) : 'Compre perto de você'}</h2><p>${activeBanner ? esc(activeBanner.message) : 'Produtos, ofertas e lojas da sua cidade em um só lugar.'}</p><div class="banner-footer"><span>${icon('pin')} Grajaú - MA</span><b>Ver destaque ${icon('arrowRight')}</b></div></div>
        <div class="banner-mark">AC</div>
      </div>

      <div class="home-section-head"><div><span>OFERTAS</span><h3>Perto de você</h3></div><button data-search-term="">Ver todas</button></div>
      <div class="offers home-offers">${offers.length ? offers.slice(0,8).map(({product:p, offer:o, store:m}) => `<article class="card home-product-card" data-product-id="${p.id}"><div class="product-img">${productMedia(p, true)}</div>${discountFor(p) ? `<span class="discount">${discountFor(p)}</span>` : ''}<div class="card-body"><div class="card-title">${esc(p.name)}</div><div class="product-price-row"><span class="price">${money(o.promo)}</span>${o.normal ? `<span class="old">${money(o.normal)}</span>` : ''}</div><div class="store">${esc(m.name)}</div><div class="dist">${icon('pin')} ${esc(m.dist || 'Grajaú')}</div></div></article>`).join('') : '<div class="empty">Nenhuma oferta ativa no momento.</div>'}</div>

      <div class="home-section-head shops-head"><div><span>LOJAS EM DESTAQUE</span><h3>Descubra lojas da cidade</h3></div><button data-search-term="">Ver todas</button></div>
      <div class="featured-stores-track">${shops.length ? shops.slice(0,8).map((m) => {
        const premium = m.plan !== 'gratis';
        return `<button class="featured-store-card" data-store-id="${m.id}">
          <div class="featured-store-cover ${m.coverData ? 'has-image' : ''}" ${m.coverData ? `style="background-image:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.58)),url('${m.coverData}')"` : ''}>
            <span class="featured-store-city">Grajaú · MA</span>
            ${premium ? `<span class="featured-store-badge">${m.plan === 'premium_banner' ? 'Premium + Banner' : 'Premium'}</span>` : ''}
            <div class="featured-store-monogram ${m.logoData ? 'with-logo' : ''}">${m.logoData ? `<img src="${m.logoData}" alt="Logo ${esc(m.name)}">` : esc(m.name.slice(0,1).toUpperCase())}</div>
          </div>
          <div class="featured-store-body">
            <div class="featured-store-title-row"><div><b>${esc(m.name)}</b><small>${esc(m.category)}</small></div>${icon('arrowRight','featured-store-arrow')}</div>
            <div class="featured-store-meta"><span>${icon('star')} ${esc(m.rating || 'Novo')}</span><span>${icon('pin')} ${esc(m.dist || 'Grajaú')}</span></div>
          </div>
        </button>`;
      }).join('') : '<div class="empty">Nenhuma loja aprovada ainda.</div>'}</div>
    </section>
    ${nav('home')}
  </main>`;
  bind();
  document.getElementById('searchBtn').onclick = () => search(document.getElementById('q').value);
  document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') search(e.target.value); });
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
      <div class="list">${results.length ? results.map(p => { const m=storeById(p.storeId); const price=currentPrice(p); const old=originalPrice(p); const avail=availabilitySummary(p); return `<article class="result"><div class="thumb">${productMedia(p, true)}</div><div><span class="tag">Disponível</span><h4>${esc(p.name)}</h4><div class="price">${money(price)}</div>${price !== old ? `<div class="old">${money(old)}</div>` : ''}${avail.length ? `<div class="availability-line">${avail.slice(0,2).map(esc).join(' · ')}</div>` : ''}<div class="store">${esc(m?.name || 'Loja')}</div><div class="dist">${icon('pin')} ${esc(m?.dist || 'Grajaú')} de você</div><button class="btn btn-yellow" data-product-id="${p.id}">Ver produto</button></div></article>`; }).join('') : '<div class="empty"><b>Nenhum produto compatível.</b><span>Tente retirar um filtro ou pesquisar de outra forma.</span></div>'}</div>
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
  const details = String(p.details || '').split('|').map(x=>x.trim()).filter(Boolean);
  app.innerHTML = `<main class="app-shell product-page">
    <div class="page-head"><button class="back" id="productBack" aria-label="Voltar">${icon('arrowLeft')}</button><b>Produto</b><div class="head-actions"><button id="headFav" aria-label="Favoritar">${icon('heart')}</button><button aria-label="Compartilhar">${icon('share')}</button></div></div>
    <div class="hero-product">${productMedia(p)}</div>
    <div class="product-info">
      <span class="eyebrow">${categoryLabel(p.type)}</span><h1>${esc(p.name)}</h1>
      <div><span class="big-price">${money(price)}</span> ${price !== old ? `<span class="old">${money(old)}</span>` : ''}</div>
      <div class="store-box" data-store-id="${m.id}"><div class="store-box-title">${esc(m.name)}</div><div class="store-box-meta">${icon('star')} ${esc(m.rating || 'Novo')} <span>•</span> ${icon('pin')} ${esc(m.dist || 'Grajaú')} de você</div></div>
      ${p.brand ? `<h3>Marca</h3><p>${esc(p.brand)}</p>` : ''}
      <h3>Disponibilidade</h3><span class="tag">Disponível</span>${availabilitySummary(p).length ? `<div class="availability-box">${availabilitySummary(p).map(x=>`<span>${esc(x)}</span>`).join('')}</div>` : ''}
      <h3>Detalhes</h3>${details.length ? details.map(d=>`<p>${esc(d)}</p>`).join('') : '<p>Consulte a loja para mais informações.</p>'}
    </div>
    <div class="sticky-actions"><button class="btn btn-green" id="waBtn">${icon('chat')} Falar com a loja</button><button class="btn btn-yellow" id="favBtn">${icon('heart')} ${fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</button></div>
  </main>`;
  bind();
  document.getElementById('productBack').onclick = () => publicState.query ? search(publicState.query) : home();
  const toggleFav=async()=>{ if(!currentClient()){ publicState.afterLogin={screen:'product',productId:p.id,favoriteId:p.id}; return clientLogin(); } const ok=await setFavorite(p.id,!fav); if(ok) product(p.id); };
  document.getElementById('favBtn').onclick = toggleFav; document.getElementById('headFav').onclick = toggleFav;
  document.getElementById('waBtn').onclick = () => { const url=whatsappUrl(m,p); if (url) { if(window.ACCloud?.enabled) window.ACCloud.trackEvent('clique_whatsapp',{storeId:m.id,productId:p.id}).catch(()=>{}); window.open(url,'_blank'); } else alert('A loja ainda não cadastrou um WhatsApp válido.'); };
  if(window.ACCloud?.enabled) window.ACCloud.trackEvent('visualizacao_produto',{storeId:m.id,productId:p.id}).catch(()=>{});
}

function store(storeId = publicState.storeId) {
  const m = storeById(storeId) || approvedStores()[0];
  if (!m || m.status !== 'aprovada') return home();
  publicState.storeId = m.id;
  const products = publicProducts().filter(p => p.storeId === m.id);
  const full = m.plan !== 'gratis';
  app.innerHTML = `<main class="app-shell">
    <section class="store-hero ${m.coverData ? 'has-cover' : ''}" ${m.coverData ? `style="--store-cover:url('${m.coverData}')"` : ''}><button class="back" data-go="home" aria-label="Voltar">${icon('arrowLeft')}</button><div class="store-icon ${m.logoData ? 'with-logo' : ''}">${m.logoData ? `<img src="${m.logoData}" alt="Logo ${esc(m.name)}">` : icon('store')}</div><h1>${esc(m.name)}</h1><div class="rating-row">${icon('star')} ${esc(m.rating || 'Novo')} ${full ? '<span>Loja em destaque</span>' : '<span>Perfil básico</span>'}</div><div class="store-meta">${icon('pin')} ${esc(m.address || 'Grajaú - MA')} <span>•</span> ${esc(m.dist || 'Grajaú')}</div><div class="store-buttons"><button class="btn btn-green" id="storeWa">${icon('chat')} WhatsApp</button>${full && m.instagram ? '<button class="btn instagram" id="storeInstagram">Instagram</button>' : ''}<button class="btn btn-yellow" id="storeMap">${icon('pin')} Como chegar</button></div></section>
    <section class="content">${full ? `<div class="store-about"><h3>Sobre a loja</h3><p>${esc(m.description || 'Comércio local em Grajaú.')}</p>${m.hours ? `<small>Horário: ${esc(m.hours)}</small>` : ''}</div>` : ''}<div class="section-title"><h3>Produtos</h3><a>${products.length} cadastrados</a></div><div class="offers">${products.length ? products.map(p => `<article class="card" data-product-id="${p.id}"><div class="product-img">${productMedia(p, true)}</div>${discountFor(p) ? `<span class="discount">${discountFor(p)}</span>` : ''}<div class="card-body"><div class="card-title">${esc(p.name)}</div><div class="price">${money(currentPrice(p))}</div>${currentPrice(p)!==originalPrice(p) ? `<div class="old">${money(originalPrice(p))}</div>` : ''}</div></article>`).join('') : '<div class="empty">A loja ainda não publicou produtos.</div>'}</div></section>
    ${nav('home')}
  </main>`;
  bind();
  document.getElementById('storeWa').onclick=()=>{ const url=whatsappUrl(m,null); if(url) { if(window.ACCloud?.enabled) window.ACCloud.trackEvent('clique_whatsapp',{storeId:m.id}).catch(()=>{}); window.open(url,'_blank'); } else alert('A loja ainda não cadastrou um WhatsApp válido.'); };
  if(document.getElementById('storeInstagram')) document.getElementById('storeInstagram').onclick=()=>{ const handle=String(m.instagram||'').replace('@','').trim(); if(handle) window.open(`https://instagram.com/${handle}`,'_blank'); };
  document.getElementById('storeMap').onclick=()=>{ if(m.address) window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.address)}`,'_blank'); };
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
  app.innerHTML = `<main class="app-shell auth-page"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Minha conta</b></div><section class="auth-shell"><div class="auth-brand">${logo()}<span>Conta do cliente</span><h1>Bem-vindo de volta</h1><p>Entre para acessar favoritos e preferências.</p></div><form class="auth-card" id="clientLoginForm"><label>E-mail<input id="clientEmail" type="email" required autocomplete="username" placeholder="seuemail@exemplo.com"></label><label>Senha<input id="clientPassword" type="password" required autocomplete="current-password" placeholder="Sua senha"></label><button class="forgot-link" type="button" data-go="clientForgot">Esqueci minha senha</button><button class="btn btn-yellow btn-block" type="submit">Entrar</button><div class="auth-divider"><span>ou</span></div><button class="btn btn-secondary btn-block" type="button" data-go="clientRegister">Criar minha conta</button><div id="clientLoginMsg"></div>${window.ACCloud?.enabled?'':'<button class="demo-fill" type="button" id="fillClientDemo">Usar acesso de demonstração</button>'}</form></section></main>`;
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
  app.innerHTML = `<main class="app-shell auth-page merchant-auth"><div class="page-head"><button class="back" data-go="profile" aria-label="Voltar">${icon('arrowLeft')}</button><b>Área do lojista</b></div><section class="auth-shell"><div class="auth-brand merchant-auth-brand">${logo()}<span>Portal do comerciante</span><h1>Gerencie sua loja</h1><p>Produtos, ofertas, desempenho e plano em um único painel.</p></div><form class="auth-card" id="merchantLoginForm"><label>E-mail<input id="merchantEmail" type="email" autocomplete="username" required placeholder="seuemail@exemplo.com"></label><label>Senha<input id="merchantPassword" type="password" autocomplete="current-password" required placeholder="Sua senha"></label><button class="forgot-link" type="button" id="merchantForgot">Esqueci minha senha</button><button class="btn btn-yellow btn-block" type="submit">Entrar no painel</button><div class="auth-divider"><span>Primeiro acesso?</span></div><button class="btn btn-secondary btn-block" type="button" data-go="merchantRegister">Cadastrar minha loja</button><button class="btn btn-outline btn-block" type="button" data-go="plansPreview">Ver planos e benefícios</button><div id="loginMsg"></div>${window.ACCloud?.enabled?'':'<button class="demo-fill" type="button" id="fillMerchantDemo">Usar acesso de demonstração</button>'}</form><button class="admin-discreet" data-go="adminLogin">Acesso administrativo</button></section></main>`;
  bind();
  document.getElementById('fillMerchantDemo')?.addEventListener('click',()=>{document.getElementById('merchantEmail').value='lojista@exemplo.com';document.getElementById('merchantPassword').value='123456';});
  document.getElementById('merchantForgot').onclick=async()=>{const email=document.getElementById('merchantEmail').value.trim().toLowerCase();const msg=document.getElementById('loginMsg');if(!email){msg.innerHTML='<div class="notice error">Digite seu e-mail para recuperar a senha.</div>';return;}if(window.ACCloud?.enabled){try{localStorage.setItem('achou_recovery_target','merchant')}catch(_){}const result=await window.ACCloud.resetPassword(email);msg.innerHTML=result.ok?'<div class="notice success">Enviamos as instruções. Abra o link do e-mail para definir uma nova senha.</div>':`<div class="notice error">${esc(result.message||'Não foi possível enviar o e-mail.')}</div>`;return;}msg.innerHTML='<div class="notice success">A recuperação será enviada por e-mail quando o backend estiver conectado.</div>';};
  document.getElementById('merchantLoginForm').onsubmit = async e => { e.preventDefault(); const email = document.getElementById('merchantEmail').value.trim().toLowerCase(); const password = document.getElementById('merchantPassword').value; const msg=document.getElementById('loginMsg'); if(window.ACCloud?.enabled){msg.innerHTML='<div class="notice">Entrando...</div>';const result=await window.ACCloud.signInMerchant(email,password);if(!result.ok){msg.innerHTML=`<div class="notice error">${esc(result.message||'E-mail ou senha inválidos.')}</div>`;return;}upsertCloudMerchant(result.store,result.user);db.session.merchantId=result.store.id;await syncCloudMerchantCatalog(result.store.id);saveDb();syncPublicStoreState();merchant();return;} const found = db.merchants.find(m => m.email.toLowerCase() === email && m.password === password); if (!found) { msg.innerHTML = '<div class="notice error">E-mail ou senha inválidos.</div>'; return; } db.session.merchantId = found.id; saveDb(); merchant(); };
}

function merchantRegister() {
  const intent = publicState.merchantPlanIntent ? `<div class="selected-plan-hint">Plano de interesse: <b>${planLabel(publicState.merchantPlanIntent)}</b>. Você poderá confirmar ou trocar na próxima etapa.</div>` : '';
  const categoryOptions=['Moda','Calçados','Acessórios','Alimentação','Beleza','Saúde','Tecnologia','Casa','Automotivo','Serviços','Outros'];
  app.innerHTML = `<main class="app-shell form-page merchant-register-page">
    <div class="page-head"><button class="back" data-go="merchantLogin" aria-label="Voltar">${icon('arrowLeft')}</button><b>Cadastrar minha loja</b></div>
    <div class="register-progress"><span class="active">1</span><i></i><span>2</span><i></i><span>3</span><small>Dados</small><small>Plano</small><small>Aprovação</small></div>
    <form class="form-card merchant-register-card" id="merchantRegisterForm">
      <div class="form-intro"><span class="section-icon">${icon('store')}</span><div><h2>Dados da empresa</h2><p>Preencha os dados comerciais e fiscais para análise da loja.</p></div></div>
      ${intent}
      <div class="merchant-form-section"><div><span>RESPONSÁVEL</span><h3>Acesso da conta</h3></div></div>
      <label>Nome do responsável<input id="regOwner" required placeholder="Nome completo"></label>
      <div class="merchant-form-section"><div><span>EMPRESA</span><h3>Dados cadastrais</h3></div></div>
      <label>Nome da loja<input id="regName" required placeholder="Ex.: Loja Exemplo"></label>
      <label>Razão social<input id="regLegalName" required placeholder="Razão social registrada no CNPJ"></label>
      <div class="two-cols merchant-legal-grid">
        <label>CNPJ<input id="regCnpj" required inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00"></label>
        <label>Inscrição estadual<input id="regStateRegistration" required placeholder="Número ou ISENTO"></label>
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
      <label>Horário de funcionamento<input id="regHours" placeholder="Seg a Sáb, 8h às 18h"></label>
      <label>Descrição<textarea id="regDescription" placeholder="Conte um pouco sobre a loja"></textarea></label>

      <div class="merchant-form-section"><div><span>LOGIN</span><h3>Crie seu acesso</h3></div></div>
      <div class="two-cols"><label>E-mail de acesso<input id="regEmail" type="email" required autocomplete="username" placeholder="seuemail@exemplo.com"></label><label>Senha<input id="regPassword" type="password" minlength="6" required autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label></div>
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
      hours:document.getElementById('regHours').value.trim(),
      description:document.getElementById('regDescription').value.trim(),
      email:document.getElementById('regEmail').value.trim().toLowerCase(),
      password:document.getElementById('regPassword').value
    };
    const msg=document.getElementById('regMsg');
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
      const result=await window.ACCloud.signUpMerchant({...draft,plan:chosen});
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
        db.session.merchantId=result.store.id;
        saveDb();
        syncPublicStoreState();
      }
      publicState.merchantDraft=null;
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

  app.innerHTML = `<main class="app-shell merchant merchant-dashboard-pro">
    <header class="merchant-dash-hero">
      <div class="merchant-dash-brand">
        <div><span>PAINEL DO LOJISTA</span><b>Achou, Comprou</b></div>
        <button class="merchant-ghost-icon" data-store-id="${m.id}" aria-label="Ver loja pública">${icon('eye')}</button>
      </div>
      <div class="merchant-shop-main">
        <div class="merchant-shop-avatar">${icon('store')}</div>
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
        <button data-go="merchantStore"><span>${icon('store')}</span><div><b>Minha loja</b><small>Editar informações</small></div>${icon('arrowRight','merchant-arrow')}</button>
        <button data-go="stats"><span>${icon('chart')}</span><div><b>Estatísticas</b><small>Acompanhar desempenho</small></div>${icon('arrowRight','merchant-arrow')}</button>
      </div>

      <section class="merchant-panel-card">
        <div class="merchant-panel-head"><div><span>CATÁLOGO</span><h3>Produtos recentes</h3></div><button data-go="merchantProducts">Ver todos</button></div>
        <div class="merchant-recent-list">${lastProducts.length ? lastProducts.map(p => `<button data-product-id="${p.id}"><div class="merchant-product-thumb">${productMedia(p, true)}</div><div><b>${esc(p.name)}</b><span>${categoryLabel(p.type)} · ${money(p.promo || p.price)}</span></div><i class="merchant-mini-status ${p.status === 'ativo' ? 'on' : ''}">${p.status === 'ativo' ? 'Ativo' : 'Pausado'}</i></button>`).join('') : `<div class="merchant-empty-mini"><b>Seu catálogo está vazio</b><span>Cadastre o primeiro produto para começar.</span><button data-go="productForm">Cadastrar produto</button></div>`}</div>
      </section>

      <section class="merchant-panel-card">
        <div class="merchant-panel-head"><div><span>PROMOÇÕES</span><h3>Oferta em destaque</h3></div><button data-go="merchantOffers">Gerenciar</button></div>
        ${lastOffer ? (() => { const p = db.products.find(x => x.id === lastOffer.productId); return `<div class="merchant-offer-highlight"><div><small>${p ? esc(p.name) : 'Produto'}</small><strong>${money(lastOffer.promo)}</strong><span>de ${money(lastOffer.normal)} · até ${lastOffer.validUntil ? new Date(lastOffer.validUntil+'T12:00:00').toLocaleDateString('pt-BR') : 'sem validade'}</span></div><div class="merchant-offer-badge">ATIVA</div></div>`; })() : `<div class="merchant-empty-line"><span>Nenhuma oferta ativa no momento.</span><button data-go="offerForm">Criar oferta</button></div>`}
      </section>

      <button class="merchant-logout-link" id="merchantLogout">${icon('arrowLeft')} Sair da área do lojista</button>
    </section>
    ${merchantNav('dashboard')}
  </main>`;
  bind(); document.getElementById('merchantLogout').onclick = async () => { if(window.ACCloud?.enabled) await window.ACCloud.signOut(); db.session.merchantId = null; saveDb(); profile(); };
}

function merchantProducts() {
  const m = currentMerchant(); if (!m) return merchantLogin(); const products = merchantProductsFor(m.id);
  const activeCount = products.filter(p => p.status === 'ativo').length;
  app.innerHTML = `<main class="app-shell merchant merchant-subpage">
    <div class="merchant-sub-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><div><span>CATÁLOGO</span><b>Meus produtos</b></div><button class="merchant-add-small" data-go="productForm">${icon('plus')} Novo</button></div>
    <section class="merchant-sub-body">
      <div class="merchant-summary-card"><div><small>Produtos cadastrados</small><strong>${products.length}</strong></div><div><small>Ativos</small><strong>${activeCount}</strong></div><div><small>Plano</small><strong>${planLabel(m.plan)}</strong></div></div>
      <div class="merchant-catalog-list">${products.length ? products.map(p => `<article class="merchant-catalog-item"><div class="merchant-catalog-thumb">${productMedia(p, true)}</div><div class="merchant-catalog-copy"><div><span>${categoryLabel(p.type)}</span><h3>${esc(p.name)}</h3></div><strong>${money(p.promo || p.price)}</strong><small class="merchant-mini-status ${p.status === 'ativo' ? 'on' : ''}">${p.status === 'ativo' ? 'Ativo' : 'Pausado'}</small></div><div class="merchant-catalog-actions"><button data-product-id="${p.id}" aria-label="Ver produto">${icon('eye')}</button><button data-toggle-product="${p.id}">${p.status === 'ativo' ? 'Pausar' : 'Ativar'}</button><button class="danger" data-delete-product="${p.id}">Excluir</button></div></article>`).join('') : '<div class="merchant-empty-state"><div>'+icon('package')+'</div><h3>Nenhum produto cadastrado</h3><p>Comece adicionando os produtos que seus clientes procuram.</p><button class="btn btn-yellow" data-go="productForm">Cadastrar primeiro produto</button></div>'}</div>
    </section>
    ${merchantNav('products')}
  </main>`;
  bind();
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

function merchantOffers() {
  const m = currentMerchant(); if (!m) return merchantLogin();
  const offers = merchantOffersFor(m.id).slice().reverse();
  const activeCount = offers.filter(o => o.active).length;
  const used = m.plan === 'gratis' ? Math.min(offers.length, 2) : offers.length;
  app.innerHTML = `<main class="app-shell merchant merchant-subpage">
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
  app.innerHTML = `<main class="app-shell merchant merchant-subpage">
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
        <label>Horário de funcionamento<input id="storeHours" value="${esc(m.hours||'')}" placeholder="Seg a Sáb, 8h às 18h"></label>
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
  document.getElementById('merchantStoreForm').onsubmit=async e=>{
    e.preventDefault();
    const msg=document.getElementById('storeSaveMsg');
    const submit=e.currentTarget.querySelector('button[type="submit"]');
    const patch={
      logoData:storeLogoPicker.get(), coverData:storeCoverPicker.get(),
      name:document.getElementById('storeName').value.trim(),
      category:document.getElementById('storeCategory').value,
      whatsapp:document.getElementById('storeWhatsapp').value.trim(),
      instagram:document.getElementById('storeInstagram').value.trim(),
      address:document.getElementById('storeAddress').value.trim(),
      hours:document.getElementById('storeHours').value.trim(),
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
  app.innerHTML = `<main class="app-shell form-page"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Cadastrar produto</b></div><form class="form-card" id="productFormEl"><div class="form-intro"><span class="section-icon">${icon('package')}</span><div><h2>Informações do produto</h2><p>Cadastre dados que o cliente poderá usar na busca inteligente.</p></div></div><div class="product-media-field"><label class="media-label">Foto principal do produto</label><input class="media-file-input" id="prodImageFile" type="file" accept="image/*"><button class="media-picker product" type="button" id="prodImagePreview"></button><small>Use uma foto clara, preferencialmente com o produto centralizado.</small></div><label>Nome<input id="prodName" required placeholder="Ex.: Tênis infantil"></label><label>Categoria<select id="prodCat"><option value="roupa">Roupa</option><option value="calcado">Calçado</option><option value="pizza">Pizza / Alimentação</option><option value="beleza">Beleza / Perfumaria</option><option value="celular">Celular</option><option value="outro">Outro</option></select></label><label>Marca<input id="prodBrand" placeholder="Marca"></label><div class="two-cols"><label>Preço normal<input id="prodPrice" required placeholder="159,90"></label><label>Preço promocional<input id="prodPromo" placeholder="129,90"></label></div><div id="dynamicFields"></div><label>Controle de estoque<select id="prodStock"><option value="simples">Simples — disponível/indisponível</option><option value="detalhado">Detalhado — por variação</option></select></label><div id="variantSection" class="hidden"><div class="variation-head"><div><b>Variações e quantidade</b><span>Ex.: Nº 28 / Rosa / 2 unidades</span></div><button class="mini-action" id="addVariant" type="button">${icon('plus')} Adicionar</button></div><div id="variantRows"></div></div><label>Descrição<textarea id="prodDescription" placeholder="Descrição do produto"></textarea></label><button class="btn btn-yellow btn-block" type="submit">Salvar produto</button><div id="saveMsg"></div></form></main>`;
  bind();
  const productImagePicker = bindImagePicker('prodImageFile','prodImagePreview',{maxW:1000,maxH:1000,quality:.78,emptyTitle:'Adicionar foto',emptyText:'Foto principal do produto'});
  const sel = document.getElementById('prodCat'), box = document.getElementById('dynamicFields'), stock = document.getElementById('prodStock'), variantSection=document.getElementById('variantSection'), variantRows=document.getElementById('variantRows');
  function dyn() { const map = { roupa: '<label>Tamanhos disponíveis<input id="prodExtra1" placeholder="P, M, G"></label><label>Cores disponíveis<input id="prodExtra2" placeholder="Preto, Branco, Rosa"></label>', calcado: '<label>Numerações disponíveis<input id="prodExtra1" placeholder="28, 29, 30, 31"></label><label>Cores disponíveis<input id="prodExtra2" placeholder="Preto, Azul"></label>', pizza: '<label>Tamanhos<input id="prodExtra1" placeholder="Pequena, Média, Grande"></label><label>Sabores / adicionais<input id="prodExtra2" placeholder="Calabresa, Frango, Catupiry"></label>', beleza: '<label>Tipo / volume<input id="prodExtra1" placeholder="Perfume 100 ml"></label><label>Variações<input id="prodExtra2" placeholder="Feminino, Masculino"></label>', celular: '<label>Modelo / armazenamento<input id="prodExtra1" placeholder="Modelo / 128 GB / 8 GB RAM"></label><label>Cores<input id="prodExtra2" placeholder="Preto, Branco"></label>', outro: '<label>Características<input id="prodExtra1" placeholder="Principais características"></label><input id="prodExtra2" type="hidden">' }; box.innerHTML = map[sel.value]; refreshVariantLabels(); }
  function optionLabel(){ return sel.value === 'calcado' ? 'Numeração' : sel.value === 'roupa' ? 'Tamanho' : sel.value === 'pizza' ? 'Tamanho' : 'Variação'; }
  function addVariantRow(option='',color='',qty=1){ const row=document.createElement('div'); row.className='variation-row'; row.innerHTML=`<label><span class="variation-label">${optionLabel()}</span><input class="variant-option" value="${esc(option)}" placeholder="Ex.: ${sel.value==='calcado'?'28':'M'}"></label><label>Cor / opção<input class="variant-color" value="${esc(color)}" placeholder="Ex.: Preto"></label><label>Qtd.<input class="variant-qty" type="number" min="0" value="${Number(qty)||0}"></label><button type="button" class="variant-remove" aria-label="Remover">×</button>`; row.querySelector('.variant-remove').onclick=()=>row.remove(); variantRows.appendChild(row); }
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
    const variants=[...document.querySelectorAll('.variation-row')].map(row=>({option:row.querySelector('.variant-option').value.trim(),color:row.querySelector('.variant-color').value.trim(),qty:Number(row.querySelector('.variant-qty').value||0)})).filter(v=>v.option||v.color);
    const colors = type === 'pizza' ? [] : [...new Set([...list2,...variants.map(v=>v.color).filter(Boolean)])];
    const sizes = ['roupa','pizza'].includes(type) ? [...new Set([...list1,...variants.map(v=>v.option).filter(Boolean)])] : [];
    const numbers = type === 'calcado' ? [...new Set([...list1,...variants.map(v=>v.option).filter(Boolean)])] : [];
    const payload={
      storeId:m.id,
      userId:m.ownerId || (await window.ACCloud?.getSession())?.user?.id,
      type, art,
      imageData:productImagePicker.get(),
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
  let counts={visualizacao_loja:0,clique_whatsapp:0,favorito:0,visualizacao_produto:0}, byProduct={};
  if(window.ACCloud?.enabled){
    const result=await window.ACCloud.merchantStats(m.id);
    if(result.ok){counts=result.counts||counts;byProduct=result.byProduct||{};}
  }
  const ranked=merchantProductsFor(m.id).map(p=>({p,n:byProduct[p.id]||0})).sort((a,b)=>b.n-a.n).slice(0,5);
  const max=Math.max(1,...ranked.map(x=>x.n));
  app.innerHTML = `<main class="app-shell merchant"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Estatísticas</b></div><div class="metric-grid">${metric('eye','Visualizações da loja',String(counts.visualizacao_loja||0),'Dados reais do aplicativo')}${metric('chat','Cliques no WhatsApp',String(counts.clique_whatsapp||0),'Contatos gerados')}${metric('heart','Favoritos',String(counts.favorito||0),'Produtos favoritados')}${metric('package','Produtos vistos',String(counts.visualizacao_produto||0),'Visualizações de produtos')}</div><div class="chart-card"><div class="section-title compact-title"><h3>Produtos mais vistos</h3><span>Desde o início</span></div>${ranked.length?ranked.map(x=>`<div class="bar"><span>${esc(x.p.name)}</span><i style="width:${Math.max(4,x.n/max*92)}%"></i><b>${x.n}</b></div>`).join(''):'<div class="notice">Ainda não há visualizações de produtos registradas.</div>'}</div>${merchantNav('dashboard')}</main>`;
  bind();
}

function plans() {
  const m = currentMerchant(); if (!m) return merchantLogin();
  app.innerHTML = `<main class="app-shell merchant plans-page"><div class="page-head"><button class="back" data-go="merchant" aria-label="Voltar">${icon('arrowLeft')}</button><b>Meu plano</b></div><header class="plans-hero compact"><span>PLANO ATUAL: ${planLabel(m.plan).toUpperCase()}</span><h1>Escolha o nível de presença da sua loja.</h1><p>Você pode solicitar uma mudança a qualquer momento.</p></header><section class="plans-wrap">${planCards('account')}<div id="planMsg" class="plans-note">No MVP, os planos pagos são confirmados manualmente por Pix e ativados pelo administrador.</div></section>${merchantNav('plan')}</main>`;
  bind(); document.querySelectorAll('[data-request-plan]').forEach(btn => btn.onclick = async () => {
    const requested=btn.dataset.requestPlan;
    if(window.ACCloud?.enabled){btn.disabled=true;const result=await window.ACCloud.requestMerchantPlan(m.id,requested);btn.disabled=false;if(!result.ok){document.getElementById('planMsg').innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível registrar a solicitação.')}</div>`;return;}m.requestedPlan=result.store.plano_solicitado||null;} else m.requestedPlan=requested;
    saveDb(); document.getElementById('planMsg').innerHTML = `<b>Solicitação registrada:</b> ${planLabel(requested)}. A ativação será feita pelo administrador após a confirmação do pagamento.`;
  });
}

function adminLogin() {
  app.innerHTML = `<main class="app-shell admin-login-page"><section class="admin-login-shell"><button class="admin-back-link" data-go="merchantLogin">${icon('arrowLeft')} Voltar</button><div class="admin-login-brand"><span class="admin-lock-mark">${icon('settings')}</span><span>ADMINISTRAÇÃO</span><h1>Central de gestão</h1><p>Acesso exclusivo para administração do Achou, Comprou.</p></div><form class="admin-login-card" id="adminLoginForm"><label>E-mail<input id="adminEmail" type="email" autocomplete="username" required placeholder="E-mail administrativo"></label><label>Senha<input id="adminPassword" type="password" autocomplete="current-password" required placeholder="Sua senha"></label><button class="btn btn-yellow btn-block" type="submit">Entrar no painel</button><div id="adminLoginMsg"></div>${window.ACCloud?.enabled?'':'<button class="demo-fill" type="button" id="fillAdminDemo">Usar acesso de demonstração</button>'}</form></section></main>`;
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

function adminNav(active='dashboard') {
  const items = [
    ['dashboard','admin','home','Visão geral'],
    ['stores','adminStores','store','Lojas'],
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

function admin() {
  if (!db.session.admin) return adminLogin();
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
  app.innerHTML = `<main class="app-shell admin-pro"><header class="admin-top"><div><span class="admin-kicker">PAINEL ADMINISTRATIVO</span><h1>Achou, Comprou</h1><p>Controle da plataforma em um só lugar.</p></div><button class="admin-profile-dot" aria-label="Administrador">AC</button></header><section class="admin-content"><div class="admin-alert ${pending ? 'show' : ''}">${icon('clock')}<div><b>${pending || 'Nenhuma'} ${pending===1?'loja aguardando':'lojas aguardando'} aprovação</b><span>${pending ? 'Revise os novos cadastros para liberar a publicação.' : 'Todos os cadastros estão em dia.'}</span></div>${pending ? '<button data-go="adminStores">Revisar</button>' : ''}</div><div class="admin-kpi-grid"><article><span>${icon('store')}</span><small>Lojas aprovadas</small><strong>${approved}</strong><em>${db.merchants.length} cadastradas</em></article><article><span>${icon('package')}</span><small>Produtos</small><strong>${db.products.length}</strong><em>${activeOffers} ofertas ativas</em></article><article><span>${icon('card')}</span><small>Planos pagos</small><strong>${paid}</strong><em>${paid ? Math.round(paid/Math.max(approved,1)*100) : 0}% das aprovadas</em></article><article><span>${icon('image')}</span><small>Banner principal</small><strong>${bannerStore ? 'Ativo' : '—'}</strong><em>${bannerStore ? esc(bannerStore.name) : 'Sem campanha'}</em></article></div><div class="admin-section-head"><div><span>ATALHOS</span><h2>Gestão rápida</h2></div></div><div class="admin-quick-grid"><button data-go="adminStores"><span>${icon('check')}</span><b>Aprovar lojas</b><small>Cadastros e bloqueios</small>${icon('arrowRight','admin-arrow')}</button><button data-go="adminPlans"><span>${icon('card')}</span><b>Planos</b><small>Ativação e solicitações</small>${icon('arrowRight','admin-arrow')}</button><button data-go="adminBanners"><span>${icon('image')}</span><b>Banner principal</b><small>Destaque da Home</small>${icon('arrowRight','admin-arrow')}</button><button data-go="adminCatalog"><span>${icon('package')}</span><b>Produtos e ofertas</b><small>Visão geral do catálogo</small>${icon('arrowRight','admin-arrow')}</button></div><section class="admin-panel-card"><div class="admin-panel-head"><div><span>LOJAS</span><h3>Cadastros recentes</h3></div><button data-go="adminStores">Ver todas</button></div><div class="admin-store-list">${recent.map(m=>`<button data-admin-store="${m.id}"><span class="admin-store-avatar">${esc((m.name||'L').slice(0,2).toUpperCase())}</span><span class="admin-store-copy"><b>${esc(m.name)}</b><small>${esc(m.category)} · ${planLabel(m.plan)}</small></span>${adminStatusBadge(m.status)}</button>`).join('')}</div></section><section class="admin-panel-card"><div class="admin-panel-head"><div><span>PLANOS</span><h3>Distribuição atual</h3></div><button data-go="adminPlans">Gerenciar</button></div><div class="admin-plan-bars"><div><label><span>Grátis</span><b>${planMix.gratis}</b></label><i><u style="width:${db.merchants.length?Math.max(8,planMix.gratis/db.merchants.length*100):0}%"></u></i></div><div><label><span>Premium</span><b>${planMix.premium}</b></label><i><u style="width:${db.merchants.length?Math.max(8,planMix.premium/db.merchants.length*100):0}%"></u></i></div><div><label><span>Premium + Banner</span><b>${planMix.premium_banner}</b></label><i><u style="width:${db.merchants.length?Math.max(8,planMix.premium_banner/db.merchants.length*100):0}%"></u></i></div></div></section><button class="admin-logout-link" id="adminLogout">Sair da administração</button></section>${adminNav('dashboard')}</main>`;
  bind();
  document.getElementById('adminLogout').onclick = async () => { if(window.ACCloud?.enabled) await window.ACCloud.signOut(); db.session.admin = false; saveDb(); profile(); };
  document.querySelectorAll('[data-admin-store]').forEach(b => b.onclick = () => adminStores(b.dataset.adminStore));
}

function adminStores(focusId='') {
  if (!db.session.admin) return adminLogin();
  const counts = {all:db.merchants.length, pending:db.merchants.filter(x=>x.status==='aguardando').length, approved:db.merchants.filter(x=>x.status==='aprovada').length, blocked:db.merchants.filter(x=>x.status==='bloqueada').length};
  app.innerHTML = `<main class="app-shell admin-pro admin-subpage">${adminHeader('Lojas cadastradas','Aprovação, status e acesso')}<section class="admin-content"><div class="admin-summary-strip"><div><small>Total</small><strong>${counts.all}</strong></div><div><small>Aguardando</small><strong>${counts.pending}</strong></div><div><small>Aprovadas</small><strong>${counts.approved}</strong></div><div><small>Bloqueadas</small><strong>${counts.blocked}</strong></div></div><div class="admin-filter-row"><button class="active" data-store-filter="todos">Todas</button><button data-store-filter="aguardando">Aguardando</button><button data-store-filter="aprovada">Aprovadas</button><button data-store-filter="bloqueada">Bloqueadas</button></div><div class="admin-store-management" id="adminStoreList">${db.merchants.map(store=>adminStoreCard(store,focusId)).join('')}</div></section>${adminNav('stores')}</main>`;
  bind();
  bindAdminStoreActions();
  document.querySelectorAll('[data-store-filter]').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('[data-store-filter]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
    const f=btn.dataset.storeFilter; document.querySelectorAll('[data-admin-status]').forEach(card=>card.style.display=(f==='todos'||card.dataset.adminStatus===f)?'grid':'none');
  });
  if (focusId) setTimeout(()=>document.querySelector(`[data-store-card="${focusId}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),30);
}

function adminStoreCard(store, focusId='') {
  return `<article class="admin-store-card ${focusId===store.id?'focus':''}" data-store-card="${store.id}" data-admin-status="${store.status}"><div class="admin-store-card-top"><span class="admin-store-avatar large">${esc((store.name||'L').slice(0,2).toUpperCase())}</span><div><div class="admin-store-name-row"><h3>${esc(store.name)}</h3>${adminStatusBadge(store.status)}</div><p>${esc(store.category)} · ${esc(store.address || 'Grajaú - MA')}</p><small>${esc(store.email)}</small></div></div><div class="admin-store-meta"><div><small>Plano</small><b>${planLabel(store.plan)}</b></div><div><small>Produtos</small><b>${merchantProductsFor(store.id).length}</b></div><div><small>Ofertas</small><b>${merchantOffersFor(store.id).filter(o=>o.active).length}</b></div></div><div class="admin-store-actions">${store.status==='aguardando'?`<button class="primary" data-approve="${store.id}">${icon('check')} Aprovar</button><button data-reject="${store.id}">Reprovar</button>`:''}${store.status==='aprovada'?`<button data-block="${store.id}">Bloquear loja</button><button data-view-store="${store.id}">${icon('eye')} Ver no app</button>`:''}${store.status==='bloqueada'?`<button class="primary" data-reactivate="${store.id}">Reativar</button>`:''}${store.status==='reprovada'?`<button class="primary" data-reactivate="${store.id}">Aprovar agora</button>`:''}</div></article>`;
}

function bindAdminStoreActions(){
  const changeStatus=async(id,status,button)=>{const m=storeById(id);if(!m)return;if(window.ACCloud?.enabled){button.disabled=true;const result=await window.ACCloud.updateStoreAdmin(id,{status});button.disabled=false;if(!result.ok){alert(result.message||'Não foi possível alterar a loja.');return;}Object.assign(m,window.ACCloud.localStore(result.store));}else m.status=status;saveDb();syncPublicStoreState();adminStores(m.id);};
  document.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.approve,'aprovada',b));
  document.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.reject,'reprovada',b));
  document.querySelectorAll('[data-block]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.block,'bloqueada',b));
  document.querySelectorAll('[data-reactivate]').forEach(b=>b.onclick=()=>changeStatus(b.dataset.reactivate,'aprovada',b));
  document.querySelectorAll('[data-view-store]').forEach(b=>b.onclick=()=>store(b.dataset.viewStore));
}

function adminPlans() {
  if (!db.session.admin) return adminLogin();
  const monthly = db.merchants.reduce((sum,m)=>sum+(m.status==='aprovada'?(m.plan==='premium'?49.90:m.plan==='premium_banner'?59.90:0):0),0);
  const requests = db.merchants.filter(m=>m.requestedPlan).length;
  app.innerHTML = `<main class="app-shell admin-pro admin-subpage">${adminHeader('Planos e assinaturas','Ativação manual no MVP')}<section class="admin-content"><div class="admin-plan-summary"><div><span>RECEITA MENSAL ESTIMADA</span><strong>${monthly.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</strong><small>Baseada nos planos atualmente ativos</small></div><div><span>SOLICITAÇÕES</span><strong>${requests}</strong><small>Aguardando análise</small></div></div><div class="admin-plan-cards"><article><span>GRÁTIS</span><strong>R$ 0</strong><small>2 produtos · 2 ofertas/mês</small></article><article><span>PREMIUM</span><strong>R$ 49,90</strong><small>Produtos e ofertas ilimitados</small></article><article class="featured"><span>PREMIUM + BANNER</span><strong>R$ 59,90</strong><small>Premium + destaque na Home</small></article></div><div class="admin-section-head"><div><span>LOJAS</span><h2>Gerenciar assinaturas</h2></div></div><div class="admin-subscription-list">${db.merchants.filter(m=>m.status==='aprovada').map(store=>`<article><div><b>${esc(store.name)}</b><small>${store.requestedPlan?`Solicitou ${planLabel(store.requestedPlan)}`:'Sem solicitação pendente'}</small></div><select data-plan-store="${store.id}"><option value="gratis" ${store.plan==='gratis'?'selected':''}>Grátis</option><option value="premium" ${store.plan==='premium'?'selected':''}>Premium · R$ 49,90</option><option value="premium_banner" ${store.plan==='premium_banner'?'selected':''}>Premium + Banner · R$ 59,90</option></select></article>`).join('') || '<div class="admin-empty">Nenhuma loja aprovada.</div>'}</div></section>${adminNav('plans')}</main>`;
  bind();
  document.querySelectorAll('[data-plan-store]').forEach(sel=>sel.onchange=async()=>{const m=storeById(sel.dataset.planStore);if(!m)return;const plan=sel.value;if(window.ACCloud?.enabled){sel.disabled=true;const result=await window.ACCloud.updateStoreAdmin(m.id,{plan,requestedPlan:null});sel.disabled=false;if(!result.ok){alert(result.message||'Não foi possível alterar o plano.');adminPlans();return;}Object.assign(m,window.ACCloud.localStore(result.store));}else{m.plan=plan;m.requestedPlan=null;}saveDb();syncPublicStoreState();adminPlans();});
}

function adminBanners() {
  if (!db.session.admin) return adminLogin();
  const eligible = db.merchants.filter(m=>m.status==='aprovada'&&m.plan==='premium_banner');
  const active = db.banners.find(b=>b.active);
  const activeStore = active ? storeById(active.storeId) : null;
  app.innerHTML = `<main class="app-shell admin-pro admin-subpage">${adminHeader('Banner principal','Destaque da página inicial')}<section class="admin-content"><div class="admin-banner-preview"><span>PRÉVIA DO BANNER</span><div><small>${activeStore?esc(activeStore.name):'Comércio local'}</small><h2>${active?esc(active.title):'Compre perto de você'}</h2><p>${active?esc(active.message):'Produtos e ofertas da sua cidade em um só lugar.'}</p></div></div><form class="admin-form-card" id="bannerForm"><div class="admin-form-heading"><span>${icon('image')}</span><div><b>Configurar destaque</b><small>Somente lojas Premium + Banner são elegíveis.</small></div></div>${eligible.length?`<label>Loja<select id="bannerStore">${eligible.map(m=>`<option value="${m.id}" ${active?.storeId===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select></label><label>Título<input id="bannerTitle" maxlength="60" value="${esc(active?.title||'Compre no comércio local')}"></label><label>Mensagem<input id="bannerMessage" maxlength="90" value="${esc(active?.message||'Ofertas especiais perto de você')}"></label><div class="admin-form-actions"><button class="btn btn-yellow" type="submit">Publicar banner</button>${active?'<button class="btn btn-secondary" type="button" id="disableBanner">Desativar</button>':''}</div><div id="bannerMsg"></div>`:'<div class="admin-empty">Nenhuma loja aprovada está no plano Premium + Banner.</div>'}</form></section>${adminNav('banners')}</main>`;
  bind();
  if (!eligible.length) return;
  document.getElementById('bannerForm').onsubmit=async e=>{e.preventDefault();const payload={storeId:document.getElementById('bannerStore').value,title:document.getElementById('bannerTitle').value.trim(),message:document.getElementById('bannerMessage').value.trim()};if(window.ACCloud?.enabled){const result=await window.ACCloud.publishBanner(payload);if(!result.ok){document.getElementById('bannerMsg').innerHTML=`<div class="notice error">${esc(result.message||'Não foi possível publicar o banner.')}</div>`;return;}db.banners.forEach(b=>b.active=false);db.banners.push(result.banner);}else{db.banners.forEach(b=>b.active=false);db.banners.push({id:id('banner'),...payload,active:true});}saveDb();adminBanners();};
  document.getElementById('disableBanner')?.addEventListener('click',async()=>{if(window.ACCloud?.enabled){const result=await window.ACCloud.disableBanners();if(!result.ok){alert(result.message||'Não foi possível desativar o banner.');return;}}db.banners.forEach(b=>b.active=false);saveDb();adminBanners();});
}

function adminCatalog() {
  if (!db.session.admin) return adminLogin();
  const activeProducts=db.products.filter(p=>p.status==='ativo').length;
  const activeOffers=db.offers.filter(o=>o.active).length;
  app.innerHTML=`<main class="app-shell admin-pro admin-subpage">${adminHeader('Produtos e ofertas','Visão geral do catálogo')}<section class="admin-content"><div class="admin-summary-strip three"><div><small>Produtos</small><strong>${db.products.length}</strong></div><div><small>Ativos</small><strong>${activeProducts}</strong></div><div><small>Ofertas</small><strong>${activeOffers}</strong></div></div><div class="admin-section-head"><div><span>CATÁLOGO</span><h2>Produtos cadastrados</h2></div></div><div class="admin-catalog-list">${db.products.map(p=>{const m=storeById(p.storeId);const off=activeOfferFor(p.id);return `<article><div class="admin-catalog-thumb">${productMedia(p,true)}</div><div><small>${esc(m?.name||'Loja')}</small><b>${esc(p.name)}</b><span>${esc(p.type)} · ${p.status==='ativo'?'Publicado':'Pausado'}</span></div><div class="admin-catalog-price"><strong>${money(off?.promo||p.promo||p.price)}</strong>${off?'<small>Oferta ativa</small>':''}</div></article>`}).join('')||'<div class="admin-empty">Nenhum produto cadastrado.</div>'}</div><div class="admin-section-head"><div><span>OFERTAS</span><h2>Campanhas ativas</h2></div></div><div class="admin-offer-audit">${db.offers.map(o=>{const p=db.products.find(x=>x.id===o.productId);const m=storeById(o.storeId);return `<article><div><b>${esc(p?.name||'Produto')}</b><small>${esc(m?.name||'Loja')} · validade ${o.validUntil||'não informada'}</small></div><strong>${money(o.promo)}</strong><span class="admin-status ${o.active?'ok':'wait'}">${o.active?'Ativa':'Pausada'}</span></article>`}).join('')||'<div class="admin-empty">Nenhuma oferta cadastrada.</div>'}</div></section>${adminNav('catalog')}</main>`;
  bind();
}
function bind() {
  document.querySelectorAll('[data-go]').forEach(el => el.onclick = () => {
    const go = el.dataset.go;
    ({ home, search, product, store, profile, categories, clientLogin, clientRegister, clientEditProfile, clientForgot, recentSearches, notifications, clientSettings, passwordResetConfirm, merchantLogin, merchantRegister, merchantPlanOnboarding, merchantSubmitted, plansPreview, merchant, merchantProducts, merchantOffers, merchantStore, productForm, offerForm, stats, plans, adminLogin, admin, adminStores, adminPlans, adminBanners, adminCatalog, fav: favorites }[go] || home)();
  });
  document.querySelectorAll('[data-product-id]').forEach(el => el.onclick = () => product(el.dataset.productId));
  document.querySelectorAll('[data-store-id]').forEach(el => el.onclick = () => store(el.dataset.storeId));
  document.querySelectorAll('[data-search-term]').forEach(el => el.onclick = () => search(el.dataset.searchTerm || ''));
}

async function bootstrapCloudSession(){
  if(!window.ACCloud?.enabled)return;
  await syncCloudPublicCatalog();
  const session=await window.ACCloud.getSession();
  if(!session?.user){db.session.clientId=null;db.session.merchantId=null;db.session.admin=false;saveDb();return;}
  const profile=await window.ACCloud.getProfile(session.user.id);
  if(profile?.tipo==='admin'){
    db.session.admin=true;db.session.clientId=null;db.session.merchantId=null;await syncCloudAdminData();
  } else if(profile?.tipo==='comerciante'){
    db.session.admin=false;
    let store=await window.ACCloud.getMerchantStore(session.user.id);
    if(!store){
      const ensured=await window.ACCloud.ensureMerchantStore(session.user);
      if(ensured.ok) store=ensured.store;
    }
    if(store){upsertCloudMerchant(store,session.user);db.session.merchantId=store.id;db.session.clientId=null;await syncCloudMerchantCatalog(store.id);}
  } else if(profile?.tipo==='cliente'){
    db.session.admin=false;
    upsertCloudClient(profile,session.user);
    db.session.clientId=session.user.id;db.session.merchantId=null;
    await syncCloudFavorites(session.user.id);
  }
  saveDb();
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
if(window.ACCloud?.enabled){
  window.ACCloud.onAuthChange?.((event)=>{
    if(event==='PASSWORD_RECOVERY') passwordResetConfirm();
  });
}
bootstrapCloudSession().finally(()=>{ if(!publicState.passwordRecovery) splash(); });
