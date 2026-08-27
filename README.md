# Anatomy OSPE Trainer

A free 3D anatomy web app for MBBS students in Pakistan, built around OSPE
practice (timed stations: a structure is pinned, the student identifies it).

This round is **foundation only** — asset pipeline, database schema, and a
viewer for six test bones. No quiz mode, auth, labels UI, or full skeleton yet.

Performance on mid-range Android phones is a first-class constraint, not an
afterthought.

## Attribution

Model data is [BodyParts3D](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)
by DBCLS, licensed CC BY-SA 2.1 Japan. The following credit is required and is
rendered in the app UI (see `src/components/viewer/Attribution.tsx`) — do not
remove or reword it:

> BodyParts3D, © The Database Center for Life Science, licensed CC BY-SA 2.1 Japan

## Stack

Next.js (App Router) + TypeScript · react-three-fiber + drei · GSAP ·
Supabase (Postgres + Storage) · Tailwind CSS.

## Getting started

```bash
npm install
```

The viewer reads `public/models/manifest.json`, which is **generated** and not
committed — run the asset pipeline once before starting the dev server, then:

```bash
npm run dev
```

## Asset pipeline

Converts BodyParts3D STL files into decimated, Draco-compressed `.glb` files
plus a manifest. It is a standalone Python script and is not part of the app
build.

### One-time setup

```bash
python3 -m venv scripts/.venv && ./scripts/.venv/bin/pip install -r scripts/requirements.txt
```

Draco compression shells out to `npx @gltf-transform/cli`, so Node.js must be
on `PATH` too (it already is if you can run `npm run dev`).

### Getting source data

Real data: drop the BodyParts3D STL files (named by FMA ID, e.g.
`FMA24475.stl`) and `parts_list_e.txt` into `assets/BodyParts3D_data/`. See
that folder's README.

No real data yet? Generate crude procedural stand-ins so the pipeline and
viewer can be exercised end to end:

```bash
./scripts/.venv/bin/python scripts/seed_placeholder_stls.py
```

These are spheres and cylinders, **not** anatomy. Delete them once real STLs
are in place.

### Running it

```bash
./scripts/.venv/bin/python scripts/process_assets.py
```

Options:

| Flag | Purpose |
| --- | --- |
| `--fma-ids FMA24475,FMA23131` | Process specific structures (default: the 6 test bones) |
| `--force` | Reprocess even when output is already up to date |
| `--target-triangles N` | Per-structure triangle budget (default 15,000) |

For each structure the script decimates **only if the mesh exceeds the
triangle budget**, converts millimetres to metres, rotates Z-up to Y-up,
Draco-compresses, and writes to `public/models/`. It prints a before/after
table so quality loss is visible:

```
FMA ID    Name           Tris before  Tris after  Size before  Size after  Reduction
FMA24475  left femur     13202        13202       644.7 KB     35.5 KB     0%
FMA23131  left humerus   16492        15000       805.4 KB     39.5 KB     9%
```

A `0%` row is normal and correct — the published BodyParts3D release is
already 99% reduced, so most bones are under budget and are passed through at
full detail. A fixed decimation ratio would strip the landmarks (trochanters,
condyles, the linea aspera) that OSPE identification depends on, to save
bytes that mid-range phones do not need: all six bones together are 65,340
triangles and 185 KB.

### Two conversions worth knowing about

BodyParts3D data is **millimetres in a whole-body Z-up coordinate system** —
a femur is 440 units long, centred 623 units up the body. glTF and three.js
expect **metres, Y-up**. The pipeline applies both conversions
(`MM_TO_M` and `ZUP_TO_YUP` in `scripts/process_assets.py`). Without the
rotation every long bone points at the camera and is seen end-on; without the
scale the scene falls outside the camera's far plane.

The scale is one uniform factor, so relative proportions between bones are
preserved — a fibula still reads as thinner than a femur.

It is idempotent: re-running skips any structure whose `.glb` is newer than
its source STL. Use `--force` to override.

### Adding a new structure

1. Put its `{FMA_ID}.stl` in `assets/BodyParts3D_data/` and make sure the FMA
   ID appears in `parts_list_e.txt`.
2. Run the pipeline with `--fma-ids <FMA_ID>` (or add it to `DEFAULT_FMA_IDS`
   in `scripts/process_assets.py` if it belongs to the standard set).
3. Add a `region` / `year_level` entry for it to `STRUCTURE_METADATA` in
   `scripts/seed.ts` — the manifest cannot supply these, since
   `parts_list_e.txt` only maps FMA ID to English name.
4. Re-run the seed script.

## Supabase

Apply `supabase/migrations/0001_init.sql` to your project. It creates
`structures` and `structure_relations` (the FMA part-of hierarchy), enables
RLS, and adds public **read** policies only — there are no write policies, so
public writes are denied by default.

Then copy `.env.local.example` to `.env.local`, fill it in, and seed from the
manifest:

```bash
npx tsx scripts/seed.ts
```

The seed reads `public/models/manifest.json` and upserts on `fma_id`, so it is
safe to re-run after regenerating assets. It needs `SUPABASE_SERVICE_ROLE_KEY`
(server-side only — never expose it to the browser).

## Project structure

```
scripts/                    asset pipeline + DB seed (standalone, not part of the app)
assets/BodyParts3D_data/    raw STL input (gitignored)
public/models/              generated .glb + manifest.json (gitignored)
public/draco/               self-hosted Draco decoder
supabase/migrations/        schema
src/components/viewer/      r3f canvas, scene, per-model loading, camera rig
src/lib/three/              layout, bone material, decoder path
src/lib/supabase/           browser client
src/types/                  manifest + DB row types
```

### Notes on the viewer

- Each model sits in its own `<Suspense>` boundary, so models stream in one at
  a time rather than blocking on the slowest download.
- The Draco decoder is served from `public/draco/` rather than Google's CDN, to
  avoid a third-party round trip on slow mobile networks. It is copied from
  `three/examples/jsm/libs/draco/gltf/`.
- Device pixel ratio is capped at 2 — mid-range Android phones report 3+, and
  rendering at native DPR is the biggest frame-rate cost in a scene this simple.
- The six bones are laid out on a grid (`src/lib/three/layout.ts`); they are
  unconnected bones, not an assembled skeleton. Each is re-centred on its own
  bounding box, so its original anatomical position is not used for placement
  — but that position is still in the manifest, which is what a future
  assembled-skeleton view would read.
