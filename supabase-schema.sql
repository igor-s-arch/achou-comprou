-- ACHOU, COMPROU — schema do MVP online (v0.20)
-- Aplicar SOMENTE em um projeto Supabase novo e exclusivo do Achou, Comprou.
-- Nenhum projeto existente é necessário para usar este arquivo.

create extension if not exists pgcrypto;

-- ---------- BASE ----------
create table if not exists public.cidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  estado char(2) not null,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  unique(nome, estado)
);

create table if not exists public.planos (
  id text primary key,
  nome text not null,
  preco_mensal numeric(10,2) not null default 0,
  limite_produtos integer,
  limite_ofertas_mes integer,
  pagina_completa boolean not null default false,
  estatisticas_avancadas boolean not null default false,
  selo_destaque boolean not null default false,
  prioridade_categorias boolean not null default false,
  banner_principal boolean not null default false
);

insert into public.planos(id,nome,preco_mensal,limite_produtos,limite_ofertas_mes,pagina_completa,estatisticas_avancadas,selo_destaque,prioridade_categorias,banner_principal)
values
('gratis','Grátis',0,2,2,false,false,false,false,false),
('premium','Premium',49.90,null,null,true,true,true,true,false),
('premium_banner','Premium + Banner',59.90,null,null,true,true,true,true,true)
on conflict (id) do update set
  nome=excluded.nome,
  preco_mensal=excluded.preco_mensal,
  limite_produtos=excluded.limite_produtos,
  limite_ofertas_mes=excluded.limite_ofertas_mes,
  pagina_completa=excluded.pagina_completa,
  estatisticas_avancadas=excluded.estatisticas_avancadas,
  selo_destaque=excluded.selo_destaque,
  prioridade_categorias=excluded.prioridade_categorias,
  banner_principal=excluded.banner_principal;

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  slug text not null unique,
  icone text,
  ativa boolean not null default true,
  ordem integer not null default 0
);

create table if not exists public.perfis (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  cidade_id uuid references public.cidades(id),
  avatar_url text,
  tipo text not null default 'cliente' check (tipo in ('cliente','comerciante','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lojas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  cidade_id uuid references public.cidades(id),
  nome text not null,
  slug text unique,
  logo_url text,
  capa_url text,
  categoria_principal_id uuid references public.categorias(id),
  categoria_texto text,
  descricao text,
  whatsapp text not null,
  instagram text,
  telefone text,
  endereco text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  horario_funcionamento text,
  status text not null default 'aguardando' check (status in ('aguardando','aprovada','reprovada','bloqueada')),
  plano_id text not null default 'gratis' references public.planos(id),
  plano_solicitado text references public.planos(id),
  plano_ativo_ate timestamptz,
  avaliacao numeric(3,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  categoria_id uuid references public.categorias(id),
  nome text not null,
  slug text,
  marca text,
  descricao text,
  tipo text not null default 'outro',
  preco_normal numeric(10,2) not null check (preco_normal >= 0),
  preco_promocional numeric(10,2) check (preco_promocional is null or preco_promocional >= 0),
  estoque_modo text not null default 'simples' check (estoque_modo in ('simples','detalhado')),
  disponivel boolean not null default true,
  ativo boolean not null default true,
  foto_principal_url text,
  fotos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.produto_variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  tamanho text,
  numeracao text,
  cor text,
  volume text,
  armazenamento text,
  ram text,
  atributo_extra jsonb not null default '{}'::jsonb,
  estoque integer check (estoque is null or estoque >= 0),
  disponivel boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ofertas (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  produto_id uuid not null references public.produtos(id) on delete cascade,
  preco_normal numeric(10,2) not null check (preco_normal >= 0),
  preco_promocional numeric(10,2) not null check (preco_promocional >= 0),
  inicio timestamptz not null default now(),
  fim timestamptz,
  quantidade integer check (quantidade is null or quantidade >= 0),
  ativa boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references public.lojas(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  oferta_id uuid references public.ofertas(id) on delete set null,
  titulo text not null,
  mensagem text,
  imagem_url text,
  inicio timestamptz not null default now(),
  fim timestamptz,
  ativo boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.favoritos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete cascade,
  loja_id uuid references public.lojas(id) on delete cascade,
  oferta_id uuid references public.ofertas(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (num_nonnulls(produto_id, loja_id, oferta_id)=1)
);

create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  loja_id uuid references public.lojas(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete cascade,
  oferta_id uuid references public.ofertas(id) on delete cascade,
  tipo text not null check (tipo in ('visualizacao_loja','visualizacao_produto','clique_whatsapp','clique_banner','busca','favorito')),
  busca text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- ÍNDICES ----------
create index if not exists idx_lojas_status_cidade on public.lojas(status,cidade_id);
create index if not exists idx_lojas_owner on public.lojas(owner_id);
create unique index if not exists idx_lojas_owner_unique on public.lojas(owner_id);
create index if not exists idx_produtos_loja_ativo on public.produtos(loja_id,ativo,disponivel);
create index if not exists idx_produtos_nome on public.produtos using gin (to_tsvector('portuguese', coalesce(nome,'') || ' ' || coalesce(marca,'') || ' ' || coalesce(descricao,'')));
create index if not exists idx_variacoes_busca on public.produto_variacoes(produto_id,numeracao,tamanho,cor,disponivel);
create index if not exists idx_ofertas_ativas on public.ofertas(ativa,inicio,fim);
create index if not exists idx_eventos_loja_tipo on public.eventos(loja_id,tipo,created_at desc);
create unique index if not exists idx_favorito_produto_unico on public.favoritos(user_id,produto_id) where produto_id is not null;
create unique index if not exists idx_favorito_loja_unico on public.favoritos(user_id,loja_id) where loja_id is not null;
create unique index if not exists idx_favorito_oferta_unico on public.favoritos(user_id,oferta_id) where oferta_id is not null;

-- ---------- FUNÇÕES DE SEGURANÇA ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.perfis p where p.user_id = auth.uid() and p.tipo = 'admin');
$$;

create or replace function public.is_store_owner(target_store uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.lojas l where l.id = target_store and l.owner_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists perfis_touch_updated_at on public.perfis;
create trigger perfis_touch_updated_at before update on public.perfis for each row execute function public.touch_updated_at();
drop trigger if exists lojas_touch_updated_at on public.lojas;
create trigger lojas_touch_updated_at before update on public.lojas for each row execute function public.touch_updated_at();
drop trigger if exists produtos_touch_updated_at on public.produtos;
create trigger produtos_touch_updated_at before update on public.produtos for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis(user_id,nome,tipo)
  values(
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'nome', ''),
    case when new.raw_user_meta_data->>'tipo' = 'comerciante' then 'comerciante' else 'cliente' end
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tipo is distinct from old.tipo and not public.is_admin() then
    raise exception 'Somente administrador pode alterar o tipo do perfil.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role_trigger on public.perfis;
create trigger protect_profile_role_trigger before update on public.perfis for each row execute function public.protect_profile_role();

-- Campos administrativos da loja não podem ser promovidos pelo próprio lojista.
create or replace function public.protect_store_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.owner_id is distinct from old.owner_id
       or new.status is distinct from old.status
       or new.plano_id is distinct from old.plano_id
       or new.plano_ativo_ate is distinct from old.plano_ativo_ate
       or new.avaliacao is distinct from old.avaliacao then
      raise exception 'Campos administrativos da loja só podem ser alterados pelo administrador.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_store_admin_fields_trigger on public.lojas;
create trigger protect_store_admin_fields_trigger before update on public.lojas for each row execute function public.protect_store_admin_fields();

-- Limites do plano Grátis também no banco, não apenas na interface.
create or replace function public.enforce_product_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_id text;
  lim integer;
  qtd integer;
begin
  select l.plano_id into p_id from public.lojas l where l.id = new.loja_id;
  select limite_produtos into lim from public.planos where id = p_id;
  if lim is not null then
    select count(*) into qtd from public.produtos where loja_id = new.loja_id;
    if qtd >= lim then raise exception 'Limite de produtos do plano atingido.'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists produtos_plan_limit on public.produtos;
create trigger produtos_plan_limit before insert on public.produtos for each row execute function public.enforce_product_plan_limit();

create or replace function public.enforce_offer_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_id text;
  lim integer;
  qtd integer;
begin
  select l.plano_id into p_id from public.lojas l where l.id = new.loja_id;
  select limite_ofertas_mes into lim from public.planos where id = p_id;
  if lim is not null then
    select count(*) into qtd
      from public.ofertas
     where loja_id = new.loja_id
       and created_at >= date_trunc('month', now())
       and created_at < date_trunc('month', now()) + interval '1 month';
    if qtd >= lim then raise exception 'Limite mensal de ofertas do plano atingido.'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists ofertas_plan_limit on public.ofertas;
create trigger ofertas_plan_limit before insert on public.ofertas for each row execute function public.enforce_offer_plan_limit();

-- ---------- RLS ----------
alter table public.cidades enable row level security;
alter table public.planos enable row level security;
alter table public.categorias enable row level security;
alter table public.perfis enable row level security;
alter table public.lojas enable row level security;
alter table public.produtos enable row level security;
alter table public.produto_variacoes enable row level security;
alter table public.ofertas enable row level security;
alter table public.banners enable row level security;
alter table public.favoritos enable row level security;
alter table public.eventos enable row level security;

-- Leitura pública básica.
create policy "publico_le_cidades" on public.cidades for select using (ativa=true);
create policy "publico_le_planos" on public.planos for select using (true);
create policy "publico_le_categorias" on public.categorias for select using (ativa=true);
create policy "publico_le_lojas_aprovadas" on public.lojas for select using (status='aprovada');
create policy "publico_le_produtos_ativos" on public.produtos for select using (
  ativo=true and disponivel=true and exists(select 1 from public.lojas l where l.id=loja_id and l.status='aprovada')
);
create policy "publico_le_variacoes_ativas" on public.produto_variacoes for select using (
  disponivel=true and exists(
    select 1 from public.produtos p join public.lojas l on l.id=p.loja_id
     where p.id=produto_id and p.ativo=true and p.disponivel=true and l.status='aprovada'
  )
);
create policy "publico_le_ofertas_ativas" on public.ofertas for select using (
  ativa=true and inicio<=now() and (fim is null or fim>now()) and exists(
    select 1 from public.lojas l where l.id=loja_id and l.status='aprovada'
  )
);
create policy "publico_le_banners_ativos" on public.banners for select using (
  ativo=true and inicio<=now() and (fim is null or fim>now()) and exists(
    select 1 from public.lojas l where l.id=loja_id and l.status='aprovada' and l.plano_id='premium_banner'
  )
);

-- Perfil do usuário.
create policy "usuario_le_proprio_perfil" on public.perfis for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy "usuario_atualiza_proprio_perfil" on public.perfis for update to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy "usuario_insere_proprio_perfil" on public.perfis for insert to authenticated with check (user_id=auth.uid() or public.is_admin());

-- Loja e catálogo do comerciante.
create policy "lojista_le_propria_loja" on public.lojas for select to authenticated using (owner_id=auth.uid() or public.is_admin());
create policy "lojista_cria_propria_loja" on public.lojas for insert to authenticated with check (
  public.is_admin() or (
    owner_id=auth.uid()
    and status='aguardando'
    and plano_id='gratis'
    and plano_ativo_ate is null
    and avaliacao is null
    and (plano_solicitado is null or plano_solicitado in ('premium','premium_banner'))
  )
);
create policy "lojista_atualiza_propria_loja" on public.lojas for update to authenticated using (owner_id=auth.uid() or public.is_admin()) with check (owner_id=auth.uid() or public.is_admin());
create policy "admin_exclui_loja" on public.lojas for delete to authenticated using (public.is_admin());

create policy "lojista_le_proprios_produtos" on public.produtos for select to authenticated using (public.is_store_owner(loja_id) or public.is_admin());
create policy "lojista_cria_produtos" on public.produtos for insert to authenticated with check (public.is_store_owner(loja_id) or public.is_admin());
create policy "lojista_atualiza_produtos" on public.produtos for update to authenticated using (public.is_store_owner(loja_id) or public.is_admin()) with check (public.is_store_owner(loja_id) or public.is_admin());
create policy "lojista_exclui_produtos" on public.produtos for delete to authenticated using (public.is_store_owner(loja_id) or public.is_admin());

create policy "lojista_gerencia_variacoes" on public.produto_variacoes for all to authenticated using (
  exists(select 1 from public.produtos p where p.id=produto_id and (public.is_store_owner(p.loja_id) or public.is_admin()))
) with check (
  exists(select 1 from public.produtos p where p.id=produto_id and (public.is_store_owner(p.loja_id) or public.is_admin()))
);

create policy "lojista_gerencia_ofertas" on public.ofertas for all to authenticated using (public.is_store_owner(loja_id) or public.is_admin()) with check (public.is_store_owner(loja_id) or public.is_admin());

-- Banner é administrado centralmente.
create policy "admin_gerencia_banners" on public.banners for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Favoritos e analytics.
create policy "usuario_gerencia_favoritos" on public.favoritos for all to authenticated using (user_id=auth.uid() or public.is_admin()) with check (user_id=auth.uid() or public.is_admin());
create policy "publico_registra_eventos_anonimos" on public.eventos for insert to anon, authenticated with check (user_id is null or user_id=auth.uid());
create policy "admin_le_eventos" on public.eventos for select to authenticated using (public.is_admin());

-- ---------- STORAGE ----------
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
  ('loja-logos','loja-logos',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('loja-capas','loja-capas',true,8388608,array['image/jpeg','image/png','image/webp']),
  ('produtos','produtos',true,8388608,array['image/jpeg','image/png','image/webp']),
  ('banners','banners',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "publico_le_imagens" on storage.objects for select using (bucket_id in ('loja-logos','loja-capas','produtos','banners'));
create policy "lojista_envia_midias" on storage.objects for insert to authenticated with check (
  bucket_id in ('loja-logos','loja-capas','produtos') and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "lojista_atualiza_midias" on storage.objects for update to authenticated using (
  bucket_id in ('loja-logos','loja-capas','produtos') and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id in ('loja-logos','loja-capas','produtos') and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "lojista_exclui_midias" on storage.objects for delete to authenticated using (
  bucket_id in ('loja-logos','loja-capas','produtos') and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "admin_gerencia_banners_storage" on storage.objects for all to authenticated using (
  bucket_id='banners' and public.is_admin()
) with check (
  bucket_id='banners' and public.is_admin()
);

-- ---------- DADOS INICIAIS ----------
insert into public.cidades(nome,estado) values ('Grajaú','MA') on conflict do nothing;
insert into public.categorias(nome,slug,icone,ordem) values
('Moda','moda','shirt',1),
('Alimentação','alimentacao','food',2),
('Beleza','beleza','beauty',3),
('Saúde','saude','health',4),
('Casa','casa','home',5),
('Tecnologia','tecnologia','phone',6),
('Automotivo','automotivo','car',7),
('Serviços','servicos','tool',8),
('Outros','outros','grid',9)
on conflict do nothing;


-- V0.19 — ajustes para operação online
alter table public.lojas add column if not exists email_contato text;

alter function public.touch_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_role() from public, anon, authenticated;
revoke execute on function public.protect_store_admin_fields() from public, anon, authenticated;
revoke execute on function public.enforce_product_plan_limit() from public, anon, authenticated;
revoke execute on function public.enforce_offer_plan_limit() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_store_owner(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_store_owner(uuid) to authenticated;

create index if not exists idx_lojas_categoria_principal_id on public.lojas(categoria_principal_id);
create index if not exists idx_lojas_cidade_id on public.lojas(cidade_id);
create index if not exists idx_lojas_plano_id on public.lojas(plano_id);
create index if not exists idx_lojas_plano_solicitado on public.lojas(plano_solicitado);
create index if not exists idx_produtos_categoria_id on public.produtos(categoria_id);
create index if not exists idx_ofertas_loja_id on public.ofertas(loja_id);
create index if not exists idx_ofertas_produto_id on public.ofertas(produto_id);
create index if not exists idx_banners_loja_id on public.banners(loja_id);
create index if not exists idx_banners_produto_id on public.banners(produto_id);
create index if not exists idx_banners_oferta_id on public.banners(oferta_id);
create index if not exists idx_favoritos_loja_id on public.favoritos(loja_id);
create index if not exists idx_favoritos_produto_id on public.favoritos(produto_id);
create index if not exists idx_favoritos_oferta_id on public.favoritos(oferta_id);
create index if not exists idx_eventos_user_id on public.eventos(user_id);
create index if not exists idx_eventos_produto_id on public.eventos(produto_id);
create index if not exists idx_eventos_oferta_id on public.eventos(oferta_id);
create index if not exists idx_perfis_cidade_id on public.perfis(cidade_id);

create policy "lojista_le_eventos_da_loja" on public.eventos for select to authenticated using (public.is_store_owner(loja_id));

revoke all privileges on table public.cidades, public.planos, public.categorias, public.perfis, public.lojas, public.produtos, public.produto_variacoes, public.ofertas, public.banners, public.favoritos, public.eventos from anon, authenticated;
grant select on table public.cidades, public.planos, public.categorias, public.lojas, public.produtos, public.produto_variacoes, public.ofertas, public.banners to anon, authenticated;
grant select, insert, update on table public.perfis to authenticated;
grant select, insert, update, delete on table public.lojas, public.produtos, public.produto_variacoes, public.ofertas, public.banners, public.favoritos to authenticated;
grant insert on table public.eventos to anon, authenticated;
grant select on table public.eventos to authenticated;
revoke all privileges on sequence public.eventos_id_seq from anon, authenticated;
grant usage on sequence public.eventos_id_seq to anon, authenticated;


-- V0.21 — avatares opcionais de clientes
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "publico_le_avatars" on storage.objects
for select using (bucket_id='avatars');

create policy "usuario_envia_avatar" on storage.objects
for insert to authenticated
with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "usuario_atualiza_avatar" on storage.objects
for update to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);

create policy "usuario_exclui_avatar" on storage.objects
for delete to authenticated
using (bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);


-- V0.22 — cadastro profissional do lojista
alter table public.lojas add column if not exists categorias text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='lojas_categorias_max_3'
      and conrelid='public.lojas'::regclass
  ) then
    alter table public.lojas
      add constraint lojas_categorias_max_3
      check (coalesce(cardinality(categorias),0) <= 3);
  end if;
end $$;

insert into public.categorias(nome,slug,icone,ordem) values
('Calçados','calcados','bag',2),
('Acessórios','acessorios','bag',3)
on conflict (slug) do update set nome=excluded.nome, ativa=true;

create table if not exists public.loja_dados_fiscais (
  loja_id uuid primary key references public.lojas(id) on delete cascade,
  razao_social text not null,
  cnpj text not null,
  inscricao_estadual text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loja_dados_fiscais_cnpj_14 check (length(regexp_replace(cnpj,'\D','','g'))=14)
);

create unique index if not exists idx_loja_dados_fiscais_cnpj_unique
on public.loja_dados_fiscais ((regexp_replace(cnpj,'\D','','g')));

alter table public.loja_dados_fiscais enable row level security;

create policy "lojista_le_dados_fiscais" on public.loja_dados_fiscais
for select to authenticated
using (public.is_store_owner(loja_id) or public.is_admin());

create policy "lojista_cria_dados_fiscais" on public.loja_dados_fiscais
for insert to authenticated
with check (public.is_store_owner(loja_id) or public.is_admin());

create policy "lojista_atualiza_dados_fiscais" on public.loja_dados_fiscais
for update to authenticated
using (public.is_store_owner(loja_id) or public.is_admin())
with check (public.is_store_owner(loja_id) or public.is_admin());

grant select, insert, update on table public.loja_dados_fiscais to authenticated;

create or replace function public.criar_loja_com_dados_fiscais(
  p_cidade_id uuid,
  p_categoria_principal_id uuid,
  p_nome text,
  p_categorias text[],
  p_whatsapp text,
  p_instagram text,
  p_endereco text,
  p_horario text,
  p_descricao text,
  p_email_contato text,
  p_plano_solicitado text,
  p_razao_social text,
  p_cnpj text,
  p_inscricao_estadual text
)
returns public.lojas
language plpgsql
security invoker
set search_path = public
as $$
declare
  nova_loja public.lojas;
  categorias_limpas text[];
begin
  if auth.uid() is null then raise exception 'Usuário não autenticado.'; end if;

  categorias_limpas := array(
    select distinct btrim(x)
    from unnest(coalesce(p_categorias, '{}'::text[])) as x
    where btrim(x) <> ''
    limit 3
  );

  if cardinality(categorias_limpas) < 1 then raise exception 'Selecione pelo menos uma categoria.'; end if;
  if p_razao_social is null or btrim(p_razao_social) = '' then raise exception 'Informe a razão social.'; end if;
  if length(regexp_replace(coalesce(p_cnpj,''),'\D','','g')) <> 14 then raise exception 'CNPJ inválido.'; end if;
  if p_inscricao_estadual is null or btrim(p_inscricao_estadual) = '' then raise exception 'Informe a inscrição estadual ou ISENTO.'; end if;

  insert into public.lojas(
    owner_id, cidade_id, nome, categoria_principal_id, categoria_texto, categorias,
    whatsapp, instagram, endereco, horario_funcionamento, descricao, email_contato,
    status, plano_id, plano_solicitado
  )
  values(
    auth.uid(), p_cidade_id, p_nome, p_categoria_principal_id,
    array_to_string(categorias_limpas, ' · '), categorias_limpas,
    p_whatsapp, nullif(p_instagram,''), p_endereco, nullif(p_horario,''),
    nullif(p_descricao,''), nullif(p_email_contato,''),
    'aguardando', 'gratis', nullif(p_plano_solicitado,'gratis')
  )
  returning * into nova_loja;

  insert into public.loja_dados_fiscais(loja_id, razao_social, cnpj, inscricao_estadual)
  values(nova_loja.id, btrim(p_razao_social), regexp_replace(p_cnpj,'\D','','g'), btrim(p_inscricao_estadual));

  return nova_loja;
end;
$$;

revoke execute on function public.criar_loja_com_dados_fiscais(uuid,uuid,text,text[],text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.criar_loja_com_dados_fiscais(uuid,uuid,text,text[],text,text,text,text,text,text,text,text,text,text) to authenticated;
