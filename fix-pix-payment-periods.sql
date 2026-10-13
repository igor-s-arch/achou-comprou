-- Achou, Comprou — corrigir pagamento PIX por período.
-- Execute no SQL Editor do projeto Supabase resftvpoacditoksisjj.

alter table public.pagamentos
  add column if not exists duracao_meses integer not null default 1;

alter table public.pagamentos
  drop constraint if exists pagamentos_duracao_meses_valid;
alter table public.pagamentos
  add constraint pagamentos_duracao_meses_valid check (duracao_meses in (1,3,6,12));

drop function if exists public.solicitar_pagamento_plano(uuid,text);

create or replace function public.solicitar_pagamento_plano(
  p_loja_id uuid,
  p_plano_id text,
  p_duracao_meses integer default 1
)
returns public.pagamentos
language plpgsql
security definer
set search_path=public
as $$
declare
  l public.lojas;
  existing_payment public.pagamentos;
  novo public.pagamentos;
  valor_total numeric(10,2);
begin
  if auth.uid() is null then
    raise exception 'Entre na sua conta de lojista.';
  end if;
  if p_duracao_meses not in (1,3,6,12) then
    raise exception 'Selecione um período válido.';
  end if;

  select * into l from public.lojas where id=p_loja_id;
  if l.id is null or l.owner_id is distinct from auth.uid() then
    raise exception 'Loja inválida para este acesso.';
  end if;
  if l.status <> 'aprovada' then
    raise exception 'A loja precisa estar aprovada antes do pagamento.';
  end if;
  if p_plano_id not in ('premium','premium_banner') then
    raise exception 'Selecione um plano pago válido.';
  end if;

  select * into existing_payment
  from public.pagamentos
  where loja_id=p_loja_id and status='em_analise'
  order by solicitado_em desc
  limit 1;
  if existing_payment.id is not null then
    raise exception 'Já existe um pagamento em análise para esta loja.';
  end if;

  valor_total := case p_plano_id
    when 'premium' then case p_duracao_meses
      when 1 then 49.90 when 3 then 139.90 when 6 then 269.90 when 12 then 479.90 end
    when 'premium_banner' then case p_duracao_meses
      when 1 then 59.90 when 3 then 169.90 when 6 then 319.90 when 12 then 569.90 end
  end;

  update public.pagamentos
  set status='cancelado', updated_at=now()
  where loja_id=p_loja_id and status='aguardando';

  update public.lojas
  set plano_solicitado=p_plano_id
  where id=p_loja_id;

  insert into public.pagamentos(loja_id,plano_id,valor,duracao_meses,metodo,status)
  values(p_loja_id,p_plano_id,valor_total,p_duracao_meses,'pix','aguardando')
  returning * into novo;

  return novo;
end;
$$;

revoke execute on function public.solicitar_pagamento_plano(uuid,text,integer) from public, anon;
grant execute on function public.solicitar_pagamento_plano(uuid,text,integer) to authenticated;

create or replace function public.confirmar_pagamento_pix(
  p_pagamento_id uuid,
  p_observacao text default null
)
returns public.pagamentos
language plpgsql
security definer
set search_path=public
as $$
declare
  pg public.pagamentos;
  l public.lojas;
  inicio timestamptz;
  fim timestamptz;
  meses integer;
begin
  if not public.is_admin() then
    raise exception 'Acesso administrativo necessário.';
  end if;

  select * into pg from public.pagamentos where id=p_pagamento_id for update;
  if pg.id is null then raise exception 'Pagamento não encontrado.'; end if;
  if pg.status='pago' then return pg; end if;
  if pg.status not in ('aguardando','em_analise','recusado') then
    raise exception 'Este pagamento não pode ser confirmado.';
  end if;

  select * into l from public.lojas where id=pg.loja_id for update;
  if l.id is null then raise exception 'Loja não encontrada.'; end if;

  meses := case when pg.duracao_meses in (1,3,6,12) then pg.duracao_meses else 1 end;
  inicio := case
    when l.plano_id=pg.plano_id and l.plano_ativo_ate is not null and l.plano_ativo_ate > now()
      then l.plano_ativo_ate
    else now()
  end;
  fim := inicio + make_interval(months=>meses);

  update public.lojas
  set plano_id=pg.plano_id, plano_solicitado=null, plano_ativo_ate=fim
  where id=pg.loja_id;

  if pg.plano_id <> 'premium_banner' then
    update public.banners set ativo=false where loja_id=pg.loja_id and ativo=true;
  end if;

  update public.pagamentos
  set status='pago',
      pago_em=coalesce(pago_em,now()),
      confirmado_em=now(),
      confirmado_por=auth.uid(),
      observacao=coalesce(p_observacao,observacao),
      periodo_inicio=inicio,
      periodo_fim=fim,
      duracao_meses=meses,
      updated_at=now()
  where id=p_pagamento_id
  returning * into pg;

  return pg;
end;
$$;

revoke execute on function public.confirmar_pagamento_pix(uuid,text) from public, anon;
grant execute on function public.confirmar_pagamento_pix(uuid,text) to authenticated;

create or replace function public.ativar_plano_manual(
  p_loja_id uuid,
  p_plano_id text,
  p_dias integer default 30,
  p_observacao text default 'Ativação manual pelo administrador'
)
returns public.pagamentos
language plpgsql
security definer
set search_path=public
as $$
declare
  l public.lojas;
  inicio timestamptz;
  fim timestamptz;
  pg public.pagamentos;
  meses integer;
begin
  if not public.is_admin() then raise exception 'Acesso administrativo necessário.'; end if;
  if p_plano_id not in ('premium','premium_banner') then raise exception 'Plano pago inválido.'; end if;
  if p_dias < 1 or p_dias > 365 then raise exception 'Período inválido.'; end if;

  meses := case when p_dias>=330 then 12 when p_dias>=150 then 6 when p_dias>=75 then 3 else 1 end;
  select * into l from public.lojas where id=p_loja_id for update;
  if l.id is null then raise exception 'Loja não encontrada.'; end if;

  inicio := case
    when l.plano_id=p_plano_id and l.plano_ativo_ate is not null and l.plano_ativo_ate > now()
      then l.plano_ativo_ate
    else now()
  end;
  fim := inicio + make_interval(days=>p_dias);

  update public.lojas
  set plano_id=p_plano_id,plano_solicitado=null,plano_ativo_ate=fim
  where id=p_loja_id;

  if p_plano_id <> 'premium_banner' then
    update public.banners set ativo=false where loja_id=p_loja_id and ativo=true;
  end if;

  insert into public.pagamentos(
    loja_id,plano_id,valor,duracao_meses,metodo,status,observacao,pago_em,confirmado_em,confirmado_por,periodo_inicio,periodo_fim
  )
  values(
    p_loja_id,p_plano_id,0,meses,'cortesia','pago',p_observacao,now(),now(),auth.uid(),inicio,fim
  )
  returning * into pg;

  return pg;
end;
$$;

revoke execute on function public.ativar_plano_manual(uuid,text,integer,text) from public, anon;
grant execute on function public.ativar_plano_manual(uuid,text,integer,text) to authenticated;
