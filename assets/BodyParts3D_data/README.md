# BodyParts3D source data

This folder is **not committed** (see `.gitignore`) — it holds the raw
BodyParts3D STL files, which are large binaries under a CC BY-SA 2.1 Japan
license.

## To populate with real data

1. Get the STL files from [BodyParts3D by DBCLS](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D).
2. Copy the STL files you need into this folder, named by their FMA ID, e.g.
   `FMA24475.stl`.
3. Copy `parts_list_e.txt` (FMA ID -> English name mapping) into this folder.
4. Run the pipeline from the repo root:

   ```bash
   scripts/.venv/bin/python scripts/process_assets.py
   ```

## Placeholder data

Until you have the real STLs, `python scripts/seed_placeholder_stls.py`
(run from the repo root, using `scripts/.venv/bin/python`) will generate 6
crude procedural STLs here (box/sphere/cylinder shapes, **not** anatomically
accurate) plus a matching `parts_list_e.txt`, purely so the asset pipeline
and viewer can be exercised end to end. Delete everything in this folder
before treating the app as anything other than a plumbing test.
