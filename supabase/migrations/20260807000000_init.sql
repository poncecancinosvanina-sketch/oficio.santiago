-- Habilitar extensión PostGIS para geolocalización
create extension if not exists postgis;

-- 1. Tabla de Usuarios (Clientes)
create table public.users (
  id uuid primary key, -- Vinculado a auth.users de Supabase
  name text not null,
  phone text not null,
  address text,
  location geography(Point, 4326) not null, -- Coordenadas (lat, lng)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de Prestadores (Providers)
create table public.providers (
  id uuid primary key, -- Vinculado a auth.users de Supabase
  cuit_arca varchar(11) not null unique,
  business_name text not null,
  category text not null,
  subcategories text[] default '{}'::text[] not null,
  base_location geography(Point, 4326) not null,
  coverage_radius_km numeric not null default 5.0,
  wallet_balance numeric not null default 0.0 check (wallet_balance >= 0.0), -- Validación de saldo
  is_active boolean default false not null,
  is_verified boolean default false not null,
  rating_avg numeric(3,2) default 0.0 not null check (rating_avg >= 0.0 and rating_avg <= 5.0),
  phone text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_cuit check (length(cuit_arca) = 11 and cuit_arca ~ '^[0-9]+$') -- Formato de CUIT numérico de 11 dígitos
);

-- 3. Tabla de Solicitudes (Leads / Service Requests)
create type request_status as enum ('pending', 'accepted', 'rejected', 'completed');

create table public.service_requests (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.users(id) on delete cascade not null,
  provider_id uuid references public.providers(id) on delete set null,
  category text not null,
  description text not null,
  location geography(Point, 4326) not null,
  status request_status default 'pending'::request_status not null,
  lead_fee_charged numeric default 10000.0 not null check (lead_fee_charged >= 0.0), -- Costo fijo del lead ($10.000)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabla de Transacciones (Billetera)
create type transaction_type as enum ('credit_recharge', 'lead_deduction');
create type transaction_status as enum ('pending', 'approved', 'rejected', 'failed');

create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  provider_id uuid references public.providers(id) on delete cascade not null,
  amount numeric not null, -- Positivo para recargas, negativo para descuentos
  type transaction_type not null,
  mp_payment_id text, -- ID de referencia de Mercado Pago
  status transaction_status default 'pending'::transaction_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices espaciales para optimizar consultas geográficas
create index idx_users_location on public.users using gist (location);
create index idx_providers_base_location on public.providers using gist (base_location);
create index idx_service_requests_location on public.service_requests using gist (location);

-- Función para verificar si un proveedor está en el radio de una solicitud
create or replace function public.is_provider_in_range(
  provider_loc geography(Point, 4326),
  request_loc geography(Point, 4326),
  radius_km numeric
) returns boolean as $$
begin
  return st_dwithin(provider_loc, request_loc, radius_km * 1000);
end;
$$ language plpgsql;

-- Trigger para descontar saldo automáticamente al aceptar un Lead
create or replace function public.process_lead_acceptance()
returns trigger as $$
declare
  v_wallet_balance numeric;
  v_fee numeric;
begin
  -- Solo actuar si el estado cambia a 'accepted' y se asignó un proveedor
  if new.status = 'accepted' and old.status = 'pending' and new.provider_id is not null then
    
    -- Obtener saldo y costo del lead
    select wallet_balance into v_wallet_balance from public.providers where id = new.provider_id;
    v_fee := new.lead_fee_charged;
    
    -- Validar saldo suficiente
    if v_wallet_balance < v_fee then
      raise exception 'Saldo insuficiente en la billetera para aceptar este lead. Saldo actual: %, Requerido: %', v_wallet_balance, v_fee;
    end if;
    
    -- Descontar el saldo del proveedor
    update public.providers
    set wallet_balance = wallet_balance - v_fee
    where id = new.provider_id;
    
    -- Registrar la transacción
    insert into public.transactions (provider_id, amount, type, status)
    values (new.provider_id, -v_fee, 'lead_deduction', 'approved');
    
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_process_lead_acceptance
  after update on public.service_requests
  for each row
  execute function public.process_lead_acceptance();

-- RPC para buscar prestadores cercanos dentro de su radio de cobertura
create or replace function public.get_nearby_providers(
  client_lat double precision,
  client_lng double precision,
  p_category text
) returns table (
  id uuid,
  business_name text,
  category text,
  subcategories text[],
  coverage_radius_km numeric,
  rating_avg numeric,
  cuit_arca varchar,
  phone text,
  distance_km double precision
) as $$
begin
  return query
  select 
    p.id,
    p.business_name,
    p.category,
    p.subcategories,
    p.coverage_radius_km,
    p.rating_avg,
    p.cuit_arca,
    p.phone,
    (st_distance(p.base_location, st_setsrid(st_makepoint(client_lng, client_lat), 4326)::geography) / 1000.0)::double precision as distance_km
  from public.providers p
  where p.is_active = true 
    and p.category = p_category
    and st_dwithin(
      p.base_location,
      st_setsrid(st_makepoint(client_lng, client_lat), 4326)::geography,
      p.coverage_radius_km * 1000
    )
  order by distance_km asc;
end;
$$ language plpgsql;

-- RPC para buscar leads disponibles y cercanos para un prestador
create or replace function public.get_available_leads(
  p_provider_id uuid
) returns table (
  id uuid,
  category text,
  description text,
  distance_km double precision,
  lead_fee_charged numeric,
  created_at timestamp with time zone
) as $$
declare
  v_lat double precision;
  v_lng double precision;
  v_category text;
  v_radius numeric;
begin
  -- Obtener coordenadas y configuración del prestador
  select 
    st_y(base_location::geometry) as lat, 
    st_x(base_location::geometry) as lng, 
    p.category, 
    coverage_radius_km 
  into v_lat, v_lng, v_category, v_radius
  from public.providers p 
  where p.id = p_provider_id;

  return query
  select 
    sr.id,
    sr.category,
    sr.description,
    (st_distance(sr.location, st_setsrid(st_makepoint(v_lng, v_lat), 4326)::geography) / 1000.0)::double precision as distance_km,
    sr.lead_fee_charged,
    sr.created_at
  from public.service_requests sr
  where sr.status = 'pending'::request_status
    and sr.category = v_category
    and st_dwithin(
      sr.location,
      st_setsrid(st_makepoint(v_lng, v_lat), 4326)::geography,
      v_radius * 1000
    )
  order by sr.created_at desc;
end;
$$ language plpgsql;
