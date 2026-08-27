"""
Asset pipeline: BodyParts3D STL -> decimated, Draco-compressed .glb.

    python scripts/process_assets.py
    python scripts/process_assets.py --fma-ids FMA24475,FMA23131
    python scripts/process_assets.py --force
    python scripts/process_assets.py --target-triangles 8000

Reads STL files named `{FMA_ID}.stl` from assets/BodyParts3D_data/, resolves
their English names from parts_list_e.txt, decimates them with quadric error
metrics, exports to .glb, Draco-compresses with gltf-transform, and writes
public/models/manifest.json describing the result.

Re-running is a no-op for any structure whose output is already newer than
its source STL, unless --force is passed.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

import trimesh

REPO_ROOT = Path(__file__).resolve().parent.parent
ASSETS_DIR = REPO_ROOT / "assets" / "BodyParts3D_data"
MODELS_DIR = REPO_ROOT / "public" / "models"
MANIFEST_PATH = MODELS_DIR / "manifest.json"
PARTS_LIST_PATH = ASSETS_DIR / "parts_list_e.txt"

DEFAULT_FMA_IDS = [
    "FMA24475",  # left femur
    "FMA23131",  # left humerus
    "FMA24481",  # left fibula
    "FMA7857",  # right 1st rib
    "FMA9248",  # T4 vertebra
    "FMA16587",  # left hip bone
]

# BodyParts3D ships millimetres in a whole-body coordinate system (a femur is
# ~440 units long, centred ~620 units up the body). glTF's convention is
# metres, and three.js camera defaults and depth precision assume that range,
# so scale on the way through. Relative proportions between bones are
# preserved: this is one uniform factor, not a per-mesh normalisation.
MM_TO_M = 0.001

# BodyParts3D is Z-up (superior is +Z: the fibula sits at z~216, the femur at
# ~623, the first rib at ~1359). glTF and three.js are Y-up, so without this
# every long bone points straight at the camera and is seen end-on.
# -90° about X maps +Z (superior) onto +Y.
ZUP_TO_YUP = trimesh.transformations.rotation_matrix(-math.pi / 2, [1, 0, 0])

# Per-structure triangle budget. Decimation only kicks in above this, because
# the source meshes vary hugely in density — the BodyParts3D release is
# already 99% reduced, so a fixed decimation ratio would strip anatomical
# landmarks (trochanters, condyles, the linea aspera) that OSPE stations
# depend on, for a saving mid-range phones do not need.
DEFAULT_MAX_TRIANGLES = 15_000


@dataclass
class ManifestEntry:
    fmaId: str
    name: str
    filename: str
    triangleCount: int
    fileSizeBytes: int
    boundingBox: dict[str, list[float]]


@dataclass
class ProcessResult:
    fma_id: str
    name: str
    triangles_before: int
    triangles_after: int
    size_before: int
    size_after: int
    skipped: bool


def load_parts_list() -> dict[str, str]:
    if not PARTS_LIST_PATH.exists():
        raise FileNotFoundError(
            f"Missing {PARTS_LIST_PATH}. Populate assets/BodyParts3D_data/ with "
            "the BodyParts3D STL files and parts_list_e.txt first "
            "(see assets/BodyParts3D_data/README.md)."
        )
    names: dict[str, str] = {}
    for line in PARTS_LIST_PATH.read_text().splitlines():
        line = line.strip()
        if not line:
            continue
        fma_id, _, name = line.partition("\t")
        if not name:
            fma_id, _, name = line.partition(" ")
        names[fma_id.strip()] = name.strip()
    return names


def is_up_to_date(stl_path: Path, glb_path: Path, manifest: dict[str, ManifestEntry], fma_id: str) -> bool:
    if not glb_path.exists() or fma_id not in manifest:
        return False
    return glb_path.stat().st_mtime >= stl_path.stat().st_mtime


def draco_compress(src: Path, dst: Path) -> None:
    if shutil.which("npx") is None:
        raise RuntimeError(
            "npx not found on PATH. Node.js is required to run @gltf-transform/cli "
            "for Draco compression."
        )
    # `draco`, not `optimize`: optimize also runs a simplify pass, which would
    # decimate a second time on top of the quadric pass above and leave the
    # manifest's triangle counts describing a mesh that no longer exists.
    result = subprocess.run(
        [
            "npx",
            "--yes",
            "@gltf-transform/cli",
            "draco",
            str(src),
            str(dst),
        ],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"gltf-transform failed for {src.name}:\n{result.stdout}\n{result.stderr}"
        )


def process_one(fma_id: str, name: str, target_triangles: int, force: bool, manifest: dict[str, ManifestEntry]) -> tuple[ProcessResult, ManifestEntry | None]:
    stl_path = ASSETS_DIR / f"{fma_id}.stl"
    if not stl_path.exists():
        raise FileNotFoundError(f"Missing source STL: {stl_path}")

    filename = f"{fma_id}.glb"
    glb_path = MODELS_DIR / filename

    if not force and is_up_to_date(stl_path, glb_path, manifest, fma_id):
        existing = manifest[fma_id]
        return (
            ProcessResult(
                fma_id=fma_id,
                name=name,
                triangles_before=existing.triangleCount,
                triangles_after=existing.triangleCount,
                size_before=existing.fileSizeBytes,
                size_after=existing.fileSizeBytes,
                skipped=True,
            ),
            None,
        )

    mesh = trimesh.load(stl_path, force="mesh")
    triangles_before = len(mesh.faces)
    size_before = stl_path.stat().st_size

    if triangles_before > target_triangles:
        mesh = mesh.simplify_quadric_decimation(face_count=target_triangles)

    mesh.apply_transform(ZUP_TO_YUP)
    mesh.apply_scale(MM_TO_M)

    uncompressed_path = MODELS_DIR / f"{fma_id}.uncompressed.glb"
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    # Without normals the glTF has POSITION only, and every physically-based
    # material in the viewer shades it pure black.
    mesh.export(uncompressed_path, include_normals=True)

    try:
        draco_compress(uncompressed_path, glb_path)
    finally:
        uncompressed_path.unlink(missing_ok=True)

    triangles_after = len(mesh.faces)
    size_after = glb_path.stat().st_size
    bounds = mesh.bounds  # [[minx, miny, minz], [maxx, maxy, maxz]]

    entry = ManifestEntry(
        fmaId=fma_id,
        name=name,
        filename=filename,
        triangleCount=triangles_after,
        fileSizeBytes=size_after,
        boundingBox={"min": bounds[0].tolist(), "max": bounds[1].tolist()},
    )
    result = ProcessResult(
        fma_id=fma_id,
        name=name,
        triangles_before=triangles_before,
        triangles_after=triangles_after,
        size_before=size_before,
        size_after=size_after,
        skipped=False,
    )
    return result, entry


def load_manifest() -> dict[str, ManifestEntry]:
    if not MANIFEST_PATH.exists():
        return {}
    raw = json.loads(MANIFEST_PATH.read_text())
    return {item["fmaId"]: ManifestEntry(**item) for item in raw}


def save_manifest(manifest: dict[str, ManifestEntry]) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    ordered = sorted(manifest.values(), key=lambda e: e.fmaId)
    MANIFEST_PATH.write_text(json.dumps([asdict(e) for e in ordered], indent=2) + "\n")


def format_size(num_bytes: int) -> str:
    if num_bytes < 1024:
        return f"{num_bytes} B"
    kb = num_bytes / 1024
    if kb < 1024:
        return f"{kb:.1f} KB"
    return f"{kb / 1024:.2f} MB"


def print_table(results: list[ProcessResult]) -> None:
    headers = ["FMA ID", "Name", "Tris before", "Tris after", "Size before", "Size after", "Reduction"]
    rows = []
    for r in results:
        if r.skipped:
            rows.append([r.fma_id, r.name, str(r.triangles_before), "—", format_size(r.size_before), "—", "skipped (up to date)"])
            continue
        reduction = 1 - (r.triangles_after / r.triangles_before) if r.triangles_before else 0
        rows.append(
            [
                r.fma_id,
                r.name,
                str(r.triangles_before),
                str(r.triangles_after),
                format_size(r.size_before),
                format_size(r.size_after),
                f"{reduction * 100:.0f}%",
            ]
        )

    widths = [max(len(h), *(len(row[i]) for row in rows)) for i, h in enumerate(headers)] if rows else [len(h) for h in headers]

    def fmt_row(cells: list[str]) -> str:
        return "  ".join(cell.ljust(width) for cell, width in zip(cells, widths))

    print(fmt_row(headers))
    print("  ".join("-" * w for w in widths))
    for row in rows:
        print(fmt_row(row))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fma-ids", type=str, default=None, help="Comma-separated FMA IDs to process (default: the 6 test structures)")
    parser.add_argument("--force", action="store_true", help="Reprocess even if output is already up to date")
    parser.add_argument("--target-triangles", type=int, default=DEFAULT_MAX_TRIANGLES, help="Max triangles after decimation")
    args = parser.parse_args()

    fma_ids = args.fma_ids.split(",") if args.fma_ids else DEFAULT_FMA_IDS
    names = load_parts_list()
    manifest = load_manifest()

    results: list[ProcessResult] = []
    had_error = False
    for fma_id in fma_ids:
        fma_id = fma_id.strip()
        name = names.get(fma_id)
        if name is None:
            print(f"error: {fma_id} not found in {PARTS_LIST_PATH}", file=sys.stderr)
            had_error = True
            continue
        try:
            result, entry = process_one(fma_id, name, args.target_triangles, args.force, manifest)
        except Exception as exc:  # noqa: BLE001 - surface any failure per-structure, keep going
            print(f"error: {fma_id} ({name}): {exc}", file=sys.stderr)
            had_error = True
            continue
        results.append(result)
        if entry is not None:
            manifest[fma_id] = entry

    save_manifest(manifest)
    print()
    print_table(results)
    print(f"\nmanifest written to {MANIFEST_PATH}")

    if had_error:
        sys.exit(1)


if __name__ == "__main__":
    main()
