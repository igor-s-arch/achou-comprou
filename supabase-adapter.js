(() => {
  const cfg = window.ACHOU_SUPABASE || {};
  const enabled = !!(cfg.enabled && cfg.url && cfg.anonKey && window.supabase?.createClient);
  const client = enabled ? window.supabase.createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  const errorMessage = err => err?.message || 'Não foi possível concluir esta operação.';
  const normalizePlan = plan => ['gratis','premium','premium_banner'].includes(plan) ? plan : 'gratis';
  const numberFromBR = value => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const raw = String(value).trim().replace(/R\$/gi,'').replace(/\s/g,'');
    const normalized = raw.includes(',') ? raw.replace(/\./g,'').replace(',','.') : raw;
    const n = Number(normalized.replace(/[^0-9.-]/g,''));
    return Number.isFinite(n) ? n : null;
  };
  const brMoneyString = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2).replace('.',',') : '';
  };
  const authRedirectUrl = () => {
    try {
      if (location.protocol !== 'http:' && location.protocol !== 'https:') return undefined;
      return `${location.origin}${location.pathname}`;
    } catch (_) { return undefined; }
  };
  const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const categorySlugFromText = value => {
    const text = normalizeText(value);
    if (text.includes('moda') || text.includes('calcad') || text.includes('roupa')) return 'moda';
    if (text.includes('alimenta') || text.includes('pizza') || text.includes('comida')) return 'alimentacao';
    if (text.includes('beleza') || text.includes('perfume')) return 'beleza';
    if (text.includes('saude')) return 'saude';
    if (text.includes('casa')) return 'casa';
    if (text.includes('tecnologia') || text.includes('celular')) return 'tecnologia';
    if (text.includes('auto')) return 'automotivo';
    if (text.includes('servic')) return 'servicos';
    return 'outros';
  };
  const categorySlugFromProductType = type => ({
    roupa:'moda', calcado:'moda', pizza:'alimentacao', beleza:'beleza', celular:'tecnologia'
  }[type] || 'outros');
  let grajauCityId = null;
  const categoryIds = new Map();
  async function getGrajauCityId(){
    if(!client) return null;
    if(grajauCityId) return grajauCityId;
    const {data,error}=await client.from('cidades').select('id').eq('nome','Grajaú').eq('estado','MA').maybeSingle();
    if(!error && data?.id) grajauCityId=data.id;
    return grajauCityId;
  }
  async function getCategoryId(slug){
    if(!client || !slug) return null;
    if(categoryIds.has(slug)) return categoryIds.get(slug);
    const {data,error}=await client.from('categorias').select('id').eq('slug',slug).maybeSingle();
    const id=!error && data?.id ? data.id : null;
    categoryIds.set(slug,id);
    return id;
  }
  const artFor = type => type === 'calcado' ? 'shoe' : type === 'roupa' ? 'shirt' : type === 'pizza' ? 'pizza' : type === 'celular' ? 'phone' : 'bag';
  const localStore = store => ({
    id: store.id,
    ownerId: store.owner_id,
    owner: '',
    name: store.nome || 'Loja',
    category: store.categoria_texto || 'Outros',
    whatsapp: store.whatsapp || '',
    instagram: store.instagram || '',
    address: store.endereco || 'Grajaú - MA',
    hours: store.horario_funcionamento || '',
    description: store.descricao || '',
    email: store.email_contato || '', password: '',
    status: store.status || 'aguardando',
    plan: store.plano_id || 'gratis',
    requestedPlan: store.plano_solicitado || null,
    rating: store.avaliacao ? String(store.avaliacao).replace('.',',') : 'Novo',
    dist: '—',
    logoData: store.logo_url || '',
    coverData: store.capa_url || ''
  });
  const optionFromVariation = v => v.numeracao || v.tamanho || v.volume || v.atributo_extra?.opcao || '';
  const localProduct = (p, variants=[]) => {
    const ownVariants = variants.filter(v => v.produto_id === p.id).map(v => ({
      id: v.id,
      option: optionFromVariation(v),
      color: v.cor || '',
      qty: Number(v.estoque ?? 0),
      available: v.disponivel !== false
    }));
    const options = [...new Set(ownVariants.map(v => v.option).filter(Boolean))];
    const colors = [...new Set(ownVariants.map(v => v.color).filter(Boolean))];
    return {
      id:p.id, storeId:p.loja_id, type:p.tipo || 'outro', art:artFor(p.tipo),
      imageData:p.foto_principal_url || '', name:p.nome || 'Produto', brand:p.marca || '',
      price:brMoneyString(p.preco_normal), promo:p.preco_promocional == null ? '' : brMoneyString(p.preco_promocional),
      details:p.descricao || '',
      numbers:p.tipo === 'calcado' ? options : [],
      sizes:['roupa','pizza'].includes(p.tipo) ? options : [],
      colors,
      variants:ownVariants,
      stock:p.estoque_modo || 'simples',
      status:p.ativo === false ? 'pausado' : 'ativo',
      available:p.disponivel !== false
    };
  };
  const localOffer = o => ({
    id:o.id, storeId:o.loja_id, productId:o.produto_id,
    normal:brMoneyString(o.preco_normal), promo:brMoneyString(o.preco_promocional),
    validUntil:o.fim ? String(o.fim).slice(0,10) : '',
    quantity:Number(o.quantidade ?? 0), active:o.ativa !== false,
    createdAt:o.created_at || ''
  });
  const localBanner = b => ({ id:b.id, storeId:b.loja_id, productId:b.produto_id || null, offerId:b.oferta_id || null, title:b.titulo || '', message:b.mensagem || '', imageData:b.imagem_url || '', active:b.ativo !== false });

  async function dataUrlToBlob(dataUrl){
    const response = await fetch(dataUrl);
    return response.blob();
  }
  function extensionFor(blob){
    const type = String(blob?.type || '').toLowerCase();
    if(type.includes('png')) return 'png';
    if(type.includes('webp')) return 'webp';
    return 'jpg';
  }
  async function uploadDataUrl(bucket,userId,dataUrl,prefix='imagem'){
    if(!client || !dataUrl || !String(dataUrl).startsWith('data:')) return {ok:true,url:dataUrl || ''};
    try {
      const blob = await dataUrlToBlob(dataUrl);
      const ext = extensionFor(blob);
      const path = `${userId}/${prefix}-${Date.now()}-${Math.random().toString(16).slice(2,8)}.${ext}`;
      const {error} = await client.storage.from(bucket).upload(path, blob, {contentType:blob.type || `image/${ext}`, upsert:false});
      if(error) return {ok:false,message:errorMessage(error)};
      const {data} = client.storage.from(bucket).getPublicUrl(path);
      return {ok:true,url:data?.publicUrl || ''};
    } catch(err){
      return {ok:false,message:errorMessage(err)};
    }
  }

  const api = {
    enabled,
    client,
    mode: enabled ? 'cloud' : 'local',
    localStore,
    localProduct,
    localOffer,
    localBanner,

    async getSession(){
      if(!client) return null;
      const {data}=await client.auth.getSession();
      return data?.session || null;
    },

    async getProfile(userId){
      if(!client||!userId)return null;
      const {data}=await client.from('perfis').select('*').eq('user_id',userId).maybeSingle();
      return data||null;
    },

    async getMerchantStore(userId){
      if(!client||!userId)return null;
      const {data}=await client.from('lojas').select('*').eq('owner_id',userId).maybeSingle();
      return data||null;
    },

    merchantDraftFromUser(user, fallback={}){
      const meta=user?.user_metadata||{};
      return {
        owner: fallback.owner || meta.nome || meta.name || '',
        name: fallback.name || meta.loja_nome || '',
        category: fallback.category || meta.loja_categoria || 'Outros',
        whatsapp: fallback.whatsapp || meta.loja_whatsapp || '',
        instagram: fallback.instagram || meta.loja_instagram || '',
        address: fallback.address || meta.loja_endereco || '',
        hours: fallback.hours || meta.loja_horario || '',
        description: fallback.description || meta.loja_descricao || '',
        plan: normalizePlan(fallback.plan || meta.loja_plano_solicitado || 'gratis')
      };
    },

    async ensureMerchantStore(user, fallback={}){
      if(!client||!user)return {ok:false,message:'Backend não configurado.'};
      const existing=await api.getMerchantStore(user.id);
      if(existing)return {ok:true,store:existing};
      const draft=api.merchantDraftFromUser(user,fallback);
      if(!draft.name || !draft.whatsapp){
        return {ok:false,message:'O cadastro da loja ainda não possui os dados mínimos para concluir a ativação.'};
      }
      const [cidadeId,categoriaId]=await Promise.all([
        getGrajauCityId(),
        getCategoryId(categorySlugFromText(draft.category))
      ]);
      const payload={
        owner_id:user.id,
        cidade_id:cidadeId,
        nome:draft.name,
        categoria_principal_id:categoriaId,
        categoria_texto:draft.category||'Outros',
        whatsapp:draft.whatsapp,
        instagram:draft.instagram||null,
        endereco:draft.address||null,
        horario_funcionamento:draft.hours||null,
        descricao:draft.description||null,
        email_contato:user.email||null,
        status:'aguardando',
        plano_id:'gratis',
        plano_solicitado:draft.plan==='gratis'?null:draft.plan
      };
      const {data,error}=await client.from('lojas').insert(payload).select('*').single();
      if(error)return {ok:false,message:errorMessage(error)};
      return {ok:true,store:data};
    },

    async signInClient(email,password){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error)return {ok:false,message:errorMessage(error)};
      const profile=await api.getProfile(data.user.id);
      if(profile?.tipo==='comerciante'||profile?.tipo==='admin'){
        await client.auth.signOut();
        return {ok:false,message:'Este acesso não é uma conta de cliente.'};
      }
      return {ok:true,user:data.user,profile};
    },

    async signUpClient({name,email,password}){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const options={data:{nome:name,tipo:'cliente'}};
      const emailRedirectTo=authRedirectUrl();
      if(emailRedirectTo) options.emailRedirectTo=emailRedirectTo;
      const {data,error}=await client.auth.signUp({email,password,options});
      if(error)return {ok:false,message:errorMessage(error)};
      const needsEmailConfirmation=!data.session;
      const profile=data.user && !needsEmailConfirmation ? await api.getProfile(data.user.id) : null;
      return {ok:true,user:data.user,profile,needsEmailConfirmation};
    },

    async signUpMerchant({owner,name,category,whatsapp,instagram,address,hours,description,email,password,plan='gratis'}){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const normalizedPlan=normalizePlan(plan);
      const metadata={
        nome:owner,
        tipo:'comerciante',
        loja_nome:name,
        loja_categoria:category||'Outros',
        loja_whatsapp:whatsapp,
        loja_instagram:instagram||'',
        loja_endereco:address||'',
        loja_horario:hours||'',
        loja_descricao:description||'',
        loja_plano_solicitado:normalizedPlan
      };
      const options={data:metadata};
      const emailRedirectTo=authRedirectUrl();
      if(emailRedirectTo) options.emailRedirectTo=emailRedirectTo;
      const {data,error}=await client.auth.signUp({email,password,options});
      if(error)return {ok:false,message:errorMessage(error)};
      const needsEmailConfirmation=!data.session;
      let store=null;
      if(data.user && data.session){
        const created=await api.ensureMerchantStore(data.user,{owner,name,category,whatsapp,instagram,address,hours,description,plan:normalizedPlan});
        if(!created.ok)return created;
        store=created.store;
      }
      return {ok:true,user:data.user,store,needsEmailConfirmation};
    },

    async signInMerchant(email,password){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error)return {ok:false,message:errorMessage(error)};
      const profile=await api.getProfile(data.user.id);
      if(profile?.tipo!=='comerciante'&&profile?.tipo!=='admin'){
        await client.auth.signOut();
        return {ok:false,message:'Esta conta não possui acesso de lojista.'};
      }
      let store=await api.getMerchantStore(data.user.id);
      if(!store && profile?.tipo==='comerciante'){
        const ensured=await api.ensureMerchantStore(data.user);
        if(!ensured.ok){await client.auth.signOut();return ensured;}
        store=ensured.store;
      }
      if(!store){
        await client.auth.signOut();
        return {ok:false,message:'Nenhuma loja está vinculada a este acesso.'};
      }
      return {ok:true,user:data.user,profile,store};
    },

    async requestMerchantPlan(storeId,plan){
      if(!client||!storeId)return {ok:false,message:'Backend não configurado.'};
      const normalized=normalizePlan(plan);
      const {data,error}=await client.from('lojas')
        .update({plano_solicitado: normalized==='gratis'?null:normalized})
        .eq('id',storeId)
        .select('*')
        .single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,store:data};
    },

    async updateMerchantStore(storeId,patch){
      if(!client||!storeId)return {ok:false,message:'Backend não configurado.'};
      const allowed={};
      const map={name:'nome',category:'categoria_texto',whatsapp:'whatsapp',instagram:'instagram',address:'endereco',hours:'horario_funcionamento',description:'descricao',logoUrl:'logo_url',coverUrl:'capa_url'};
      for(const [key,column] of Object.entries(map)) if(Object.prototype.hasOwnProperty.call(patch,key)) allowed[column]=patch[key]||null;
      const {data,error}=await client.from('lojas').update(allowed).eq('id',storeId).select('*').single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,store:data};
    },

    async saveMerchantStore(storeId,userId,patch){
      if(!client||!storeId||!userId)return {ok:false,message:'Backend não configurado.'};
      let logoUrl=patch.logoData || '';
      let coverUrl=patch.coverData || '';
      if(String(logoUrl).startsWith('data:')){
        const uploaded=await uploadDataUrl('loja-logos',userId,logoUrl,'logo');
        if(!uploaded.ok)return uploaded;
        logoUrl=uploaded.url;
      }
      if(String(coverUrl).startsWith('data:')){
        const uploaded=await uploadDataUrl('loja-capas',userId,coverUrl,'capa');
        if(!uploaded.ok)return uploaded;
        coverUrl=uploaded.url;
      }
      return api.updateMerchantStore(storeId,{...patch,logoUrl,coverUrl});
    },

    async resetPassword(email){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const redirectTo=authRedirectUrl();
      const options=redirectTo?{redirectTo}:undefined;
      const {error}=await client.auth.resetPasswordForEmail(email,options);
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    onAuthChange(handler){
      if(!client || typeof handler!=='function') return () => {};
      const {data}=client.auth.onAuthStateChange((event,session)=>handler(event,session));
      return () => data?.subscription?.unsubscribe?.();
    },

    async updatePassword(password){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      if(!password || String(password).length < 6)return {ok:false,message:'A nova senha precisa ter pelo menos 6 caracteres.'};
      const {error}=await client.auth.updateUser({password});
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async signInAdmin(email,password){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error)return {ok:false,message:errorMessage(error)};
      const profile=await api.getProfile(data.user.id);
      if(profile?.tipo!=='admin'){
        await client.auth.signOut();
        return {ok:false,message:'Este acesso não possui permissão administrativa.'};
      }
      return {ok:true,user:data.user,profile};
    },

    async signOut(){
      if(!client)return {ok:true};
      const {error}=await client.auth.signOut();
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async loadAdminData(){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const [stores,products,variants,offers,banners]=await Promise.all([
        client.from('lojas').select('*').order('created_at',{ascending:true}),
        client.from('produtos').select('*').order('created_at',{ascending:true}),
        client.from('produto_variacoes').select('*'),
        client.from('ofertas').select('*').order('created_at',{ascending:true}),
        client.from('banners').select('*').order('created_at',{ascending:true})
      ]);
      const error=stores.error||products.error||variants.error||offers.error||banners.error;
      if(error)return {ok:false,message:errorMessage(error)};
      return {ok:true,stores:(stores.data||[]).map(localStore),products:(products.data||[]).map(p=>localProduct(p,variants.data||[])),offers:(offers.data||[]).map(localOffer),banners:(banners.data||[]).map(localBanner)};
    },

    async updateStoreAdmin(storeId,patch){
      if(!client||!storeId)return {ok:false,message:'Backend não configurado.'};
      const payload={};
      if(Object.prototype.hasOwnProperty.call(patch,'status')) payload.status=patch.status;
      if(Object.prototype.hasOwnProperty.call(patch,'plan')) payload.plano_id=normalizePlan(patch.plan);
      if(Object.prototype.hasOwnProperty.call(patch,'requestedPlan')) payload.plano_solicitado=patch.requestedPlan?normalizePlan(patch.requestedPlan):null;
      const {data,error}=await client.from('lojas').update(payload).eq('id',storeId).select('*').single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,store:data};
    },

    async publishBanner({storeId,title,message}){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const off=await client.from('banners').update({ativo:false}).eq('ativo',true);
      if(off.error)return {ok:false,message:errorMessage(off.error)};
      const {data,error}=await client.from('banners').insert({loja_id:storeId,titulo:title,mensagem:message,ativo:true}).select('*').single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,banner:localBanner(data)};
    },

    async disableBanners(){
      if(!client)return {ok:false,message:'Backend não configurado.'};
      const {error}=await client.from('banners').update({ativo:false}).eq('ativo',true);
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async loadPublicCatalog(){
      if(!client)return {ok:false};
      const [stores,products,variants,offers,banners]=await Promise.all([
        client.from('lojas').select('*').eq('status','aprovada'),
        client.from('produtos').select('*').eq('ativo',true).eq('disponivel',true),
        client.from('produto_variacoes').select('*').eq('disponivel',true),
        client.from('ofertas').select('*').eq('ativa',true),
        client.from('banners').select('*').eq('ativo',true)
      ]);
      const error=stores.error||products.error||variants.error||offers.error||banners.error;
      if(error)return {ok:false,message:errorMessage(error)};
      return {
        ok:true,
        stores:(stores.data||[]).map(localStore),
        products:(products.data||[]).map(p=>localProduct(p,variants.data||[])),
        offers:(offers.data||[]).map(localOffer),
        banners:(banners.data||[]).map(localBanner)
      };
    },

    async loadMerchantCatalog(storeId){
      if(!client||!storeId)return {ok:false,message:'Backend não configurado.'};
      const products=await client.from('produtos').select('*').eq('loja_id',storeId).order('created_at',{ascending:true});
      if(products.error)return {ok:false,message:errorMessage(products.error)};
      const ids=(products.data||[]).map(p=>p.id);
      let variants={data:[],error:null};
      if(ids.length) variants=await client.from('produto_variacoes').select('*').in('produto_id',ids);
      const offers=await client.from('ofertas').select('*').eq('loja_id',storeId).order('created_at',{ascending:true});
      const error=variants.error||offers.error;
      return error?{ok:false,message:errorMessage(error)}:{
        ok:true,
        products:(products.data||[]).map(p=>localProduct(p,variants.data||[])),
        offers:(offers.data||[]).map(localOffer)
      };
    },

    async createProduct({storeId,userId,type,name,brand,price,promo,details,stock,imageData,variants=[]}){
      if(!client||!storeId||!userId)return {ok:false,message:'Backend não configurado.'};
      let imageUrl=imageData||'';
      if(String(imageUrl).startsWith('data:')){
        const uploaded=await uploadDataUrl('produtos',userId,imageUrl,'produto');
        if(!uploaded.ok)return uploaded;
        imageUrl=uploaded.url;
      }
      const normal=numberFromBR(price);
      const promoNumber=numberFromBR(promo);
      if(normal===null)return {ok:false,message:'Informe um preço válido.'};
      const categoriaId=await getCategoryId(categorySlugFromProductType(type));
      const payload={
        loja_id:storeId,
        categoria_id:categoriaId,
        nome:name,
        marca:brand||null,
        descricao:details||null,
        tipo:type||'outro',
        preco_normal:normal,
        preco_promocional:promoNumber,
        estoque_modo:stock||'simples',
        disponivel:true,
        ativo:true,
        foto_principal_url:imageUrl||null,
        fotos:imageUrl?[imageUrl]:[]
      };
      const inserted=await client.from('produtos').insert(payload).select('*').single();
      if(inserted.error)return {ok:false,message:errorMessage(inserted.error)};
      const p=inserted.data;
      if((stock||'simples')==='detalhado' && variants.length){
        const rows=variants.map(v=>({
          produto_id:p.id,
          numeracao:type==='calcado'?(v.option||null):null,
          tamanho:['roupa','pizza'].includes(type)?(v.option||null):null,
          cor:v.color||null,
          atributo_extra:!['calcado','roupa','pizza'].includes(type)&&v.option?{opcao:v.option}:{},
          estoque:Number(v.qty||0),
          disponivel:Number(v.qty||0)>0
        }));
        const variantInsert=await client.from('produto_variacoes').insert(rows).select('*');
        if(variantInsert.error){
          await client.from('produtos').delete().eq('id',p.id);
          return {ok:false,message:errorMessage(variantInsert.error)};
        }
        return {ok:true,product:localProduct(p,variantInsert.data||[])};
      }
      return {ok:true,product:localProduct(p,[])};
    },

    async setProductActive(productId,active){
      if(!client||!productId)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.from('produtos').update({ativo:!!active}).eq('id',productId).select('*').single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,data};
    },

    async deleteProduct(productId){
      if(!client||!productId)return {ok:false,message:'Backend não configurado.'};
      const {error}=await client.from('produtos').delete().eq('id',productId);
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async createOffer({storeId,productId,normal,promo,validUntil,quantity}){
      if(!client||!storeId)return {ok:false,message:'Backend não configurado.'};
      const n=numberFromBR(normal), p=numberFromBR(promo);
      if(n===null||p===null)return {ok:false,message:'Informe preços válidos.'};
      const payload={
        loja_id:storeId, produto_id:productId,
        preco_normal:n, preco_promocional:p,
        fim:validUntil ? `${validUntil}T23:59:59` : null,
        quantidade:Number(quantity||0), ativa:true
      };
      const {data,error}=await client.from('ofertas').insert(payload).select('*').single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,offer:localOffer(data)};
    },

    async setOfferActive(offerId,active){
      if(!client||!offerId)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.from('ofertas').update({ativa:!!active}).eq('id',offerId).select('*').single();
      return error?{ok:false,message:errorMessage(error)}:{ok:true,offer:localOffer(data)};
    },

    async deleteOffer(offerId){
      if(!client||!offerId)return {ok:false,message:'Backend não configurado.'};
      const {error}=await client.from('ofertas').delete().eq('id',offerId);
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async getFavoriteProductIds(userId){
      if(!client||!userId)return {ok:true,ids:[]};
      const {data,error}=await client.from('favoritos').select('produto_id').eq('user_id',userId).not('produto_id','is',null);
      return error?{ok:false,message:errorMessage(error)}:{ok:true,ids:(data||[]).map(x=>x.produto_id).filter(Boolean)};
    },

    async setFavoriteProduct(userId,productId,active){
      if(!client||!userId||!productId)return {ok:false,message:'Backend não configurado.'};
      if(active){
        const existing=await client.from('favoritos').select('id').eq('user_id',userId).eq('produto_id',productId).maybeSingle();
        if(existing.error)return {ok:false,message:errorMessage(existing.error)};
        if(existing.data)return {ok:true};
        const {error}=await client.from('favoritos').insert({user_id:userId,produto_id:productId});
        return error?{ok:false,message:errorMessage(error)}:{ok:true};
      }
      const {error}=await client.from('favoritos').delete().eq('user_id',userId).eq('produto_id',productId);
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async updateClientProfile(userId,{name,phone,email}){
      if(!client||!userId)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.from('perfis').update({nome:name||null,telefone:phone||null}).eq('user_id',userId).select('*').single();
      if(error)return {ok:false,message:errorMessage(error)};
      const session=await api.getSession();
      const authPatch={data:{nome:name||''}};
      if(email && email!==session?.user?.email) authPatch.email=email;
      const authResult=await client.auth.updateUser(authPatch);
      if(authResult.error)return {ok:false,message:errorMessage(authResult.error)};
      return {ok:true,profile:data,user:authResult.data?.user||session?.user,emailChangePending:!!(email && email!==session?.user?.email)};
    },

    async trackEvent(type,{storeId=null,productId=null,offerId=null,search=null,metadata={}}={}){
      if(!client)return {ok:false};
      const session=await api.getSession();
      const payload={tipo:type,loja_id:storeId,produto_id:productId,oferta_id:offerId,busca:search,user_id:session?.user?.id||null,metadata};
      const {error}=await client.from('eventos').insert(payload);
      return error?{ok:false,message:errorMessage(error)}:{ok:true};
    },

    async merchantStats(storeId){
      if(!client||!storeId)return {ok:false,message:'Backend não configurado.'};
      const {data,error}=await client.from('eventos').select('tipo,produto_id,created_at').eq('loja_id',storeId);
      if(error)return {ok:false,message:errorMessage(error)};
      const rows=data||[];
      const counts={visualizacao_loja:0,visualizacao_produto:0,clique_whatsapp:0,favorito:0};
      const byProduct={};
      rows.forEach(r=>{if(Object.prototype.hasOwnProperty.call(counts,r.tipo))counts[r.tipo]++;if(r.tipo==='visualizacao_produto'&&r.produto_id)byProduct[r.produto_id]=(byProduct[r.produto_id]||0)+1;});
      return {ok:true,counts,byProduct};
    }
  };
  window.ACCloud=api;
})();
