create table perfiles (
  id uuid primary key references auth.users(id),
  rol text not null check (rol in ('operador','admin'))
);

create table lotes (
  id text primary key,
  productor text not null,
  origen text not null,
  fecha_recepcion date not null default current_date,
  cantidad_recibida numeric not null check (cantidad_recibida > 0),
  unidad text not null default 'kg',
  cantidad_consumida numeric not null default 0 check (cantidad_consumida >= 0),
  estado text not null default 'pendiente'
         check (estado in ('pendiente','liberado','bloqueado')),
  motivo_estado text,
  check (cantidad_consumida <= cantidad_recibida)
);

create table transformaciones (
  id uuid primary key default gen_random_uuid(),
  operation_key text unique not null,
  lote_origen text not null references lotes(id),
  etapa text not null,
  responsable text not null,
  fecha date not null default current_date,
  entrada numeric not null check (entrada > 0),
  salida numeric not null check (salida >= 0),
  costo_total numeric not null default 0 check (costo_total >= 0),
  incidencias text,
  creado_por uuid default auth.uid()
);

create table auditoria (
  id bigserial primary key,
  usuario uuid,
  fecha timestamptz not null default now(),
  tabla text,
  registro_id text,
  campo text,
  valor_anterior text,
  valor_nuevo text
);
