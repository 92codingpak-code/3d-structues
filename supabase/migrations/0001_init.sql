-- Foundation schema: skeletal structures + their part-of hierarchy.
-- Public read, no public write (RLS is deny-by-default; only select policies exist).

create table if not exists structures (
  id uuid primary key default gen_random_uuid(),
  fma_id text not null unique,
  name_en text not null,
  system text not null,
  region text,
  year_level smallint not null check (year_level in (1, 2)),
  storage_path text not null,
  triangle_count integer not null,
  created_at timestamptz not null default now()
);

create table if not exists structure_relations (
  parent_id uuid not null references structures (id) on delete cascade,
  child_id uuid not null references structures (id) on delete cascade,
  primary key (parent_id, child_id)
);

alter table structures enable row level security;
alter table structure_relations enable row level security;

create policy "public_read_structures"
  on structures for select
  using (true);

create policy "public_read_structure_relations"
  on structure_relations for select
  using (true);
