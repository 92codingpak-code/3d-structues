-- Adds the taxonomy slugs that the app's route hierarchy is built on:
--   /skeletal/{region_slug}/{group_slug}
--
-- The human-readable names for these live in src/lib/anatomy/taxonomy.ts,
-- which is the source of truth for the classification itself. Only the slugs
-- are stored here, so a structure can be looked up by the route the student
-- is on without the database also having to model the tree.
--
-- `region` (the existing free-text column) stays as a display label.

alter table structures
  add column if not exists region_slug text,
  add column if not exists group_slug text,
  add column if not exists division text
    check (division in ('axial', 'appendicular'));

-- The app's hottest query is "every structure in this group", which is what
-- a group page loads.
create index if not exists structures_region_group_idx
  on structures (region_slug, group_slug);

-- Supports "everything in this region" for region-level counts.
create index if not exists structures_region_idx
  on structures (region_slug);

comment on column structures.region_slug is
  'Route slug matching a region in src/lib/anatomy/taxonomy.ts';
comment on column structures.group_slug is
  'Route slug matching a group within that region';
