"""
Generates 6 crude procedural STL files as stand-ins for the real BodyParts3D
data, purely so `process_assets.py` and the viewer can be exercised end to
end before the real assets are available.

DELETE the files this writes into assets/BodyParts3D_data/ once you have the
real BodyParts3D STLs and parts_list_e.txt in place — this is test fixture
generation, not part of the real pipeline.
"""

from __future__ import annotations

import trimesh

from process_assets import ASSETS_DIR

# (fma_id, english_name, shape) — shape is a rough long-bone vs irregular-bone
# stand-in, not an anatomical model.
PLACEHOLDER_PARTS: list[tuple[str, str, str]] = [
    ("FMA24475", "left femur", "long_bone"),
    ("FMA23131", "left humerus", "long_bone"),
    ("FMA24481", "left fibula", "long_bone"),
    ("FMA7857", "right 1st rib", "curved_bone"),
    ("FMA9248", "T4 vertebra", "irregular_bone"),
    ("FMA16587", "left hip bone", "irregular_bone"),
]


def _make_long_bone() -> trimesh.Trimesh:
    shaft = trimesh.creation.cylinder(radius=1.0, height=12.0, sections=48)
    head_a = trimesh.creation.icosphere(subdivisions=3, radius=1.8)
    head_a.apply_translation([0, 0, 6.0])
    head_b = trimesh.creation.icosphere(subdivisions=3, radius=1.6)
    head_b.apply_translation([0, 0, -6.0])
    return trimesh.util.concatenate([shaft, head_a, head_b])


def _make_curved_bone() -> trimesh.Trimesh:
    import numpy as np

    # A rib-like arc: a chain of overlapping spheres along a curved path,
    # thick enough in the middle to look bone-like.
    segments = []
    n = 14
    for i in range(n):
        t = i / (n - 1)
        angle = np.pi * t
        x = 8.0 * np.cos(angle)
        y = 3.0 * np.sin(angle)
        radius = 0.7 + 0.3 * np.sin(np.pi * t)
        sphere = trimesh.creation.icosphere(subdivisions=2, radius=radius)
        sphere.apply_translation([x, y, 0])
        segments.append(sphere)
    return trimesh.util.concatenate(segments)


def _make_irregular_bone() -> trimesh.Trimesh:
    base = trimesh.creation.icosphere(subdivisions=3, radius=2.2)
    verts = base.vertices.copy()
    verts[:, 0] *= 1.6
    verts[:, 1] *= 1.1
    verts[:, 2] *= 0.8
    base.vertices = verts
    bumps = []
    for offset in ([2.2, 0, 0], [-2.2, 0.4, 0.3], [0, 1.8, -1.0]):
        bump = trimesh.creation.icosphere(subdivisions=2, radius=0.9)
        bump.apply_translation(offset)
        bumps.append(bump)
    return trimesh.util.concatenate([base, *bumps])


_BUILDERS = {
    "long_bone": _make_long_bone,
    "curved_bone": _make_curved_bone,
    "irregular_bone": _make_irregular_bone,
}


def main() -> None:
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    parts_list_path = ASSETS_DIR / "parts_list_e.txt"
    lines = []

    for fma_id, name, shape in PLACEHOLDER_PARTS:
        mesh = _BUILDERS[shape]()
        # Add high-frequency noise so decimation has something real to do,
        # subdividing first so there's enough face density to simplify.
        mesh = mesh.subdivide().subdivide()
        stl_path = ASSETS_DIR / f"{fma_id}.stl"
        mesh.export(stl_path)
        print(f"wrote {stl_path} ({len(mesh.faces)} faces)")
        lines.append(f"{fma_id}\t{name}")

    parts_list_path.write_text("\n".join(lines) + "\n")
    print(f"wrote {parts_list_path}")


if __name__ == "__main__":
    main()
