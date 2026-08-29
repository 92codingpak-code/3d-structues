import type { Manifest, ManifestEntry } from "@/types/manifest";

/** A manifest entry assigned a slot in the scene. */
export interface PlacedStructure {
  entry: ManifestEntry;
  /** World position of the structure's bounding-box centre. */
  position: [number, number, number];
  /**
   * Offset applied to the geometry inside its group so that the geometry's
   * own bounding-box centre lands on the group origin. BodyParts3D meshes
   * carry their original anatomical origin, which is nowhere near the mesh.
   */
  centerOffset: [number, number, number];
  /** Bounding-box dimensions, used for camera framing and loading placeholders. */
  size: [number, number, number];
}

/** Gap between grid cells, as a multiple of the largest structure's extent. */
const CELL_PADDING = 1.3;

function dimensions(entry: ManifestEntry): [number, number, number] {
  const { min, max } = entry.boundingBox;
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}

function center(entry: ManifestEntry): [number, number, number] {
  const { min, max } = entry.boundingBox;
  return [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
}

/**
 * Lays the structures out on an evenly spaced grid.
 *
 * These are six unconnected bones rather than an assembled skeleton, so there
 * is no anatomically meaningful arrangement to preserve — the grid just keeps
 * them from overlapping and keeps every one reachable by a click.
 */
export function layoutStructures(manifest: Manifest, columns = 3): PlacedStructure[] {
  if (manifest.length === 0) return [];

  const sizes = manifest.map(dimensions);
  const largestExtent = Math.max(...sizes.flat());
  const cell = largestExtent * CELL_PADDING;

  // Never reserve more columns than there are structures, or a group with a
  // single bone lays it out in column 0 of a three-wide grid and it sits off
  // to the left instead of centred. Most groups hold one or two structures.
  const effectiveColumns = Math.min(columns, manifest.length);
  const rows = Math.ceil(manifest.length / effectiveColumns);

  return manifest.map((entry, index) => {
    const column = index % effectiveColumns;
    const row = Math.floor(index / effectiveColumns);
    const [cx, cy, cz] = center(entry);

    return {
      entry,
      position: [
        (column - (effectiveColumns - 1) / 2) * cell,
        ((rows - 1) / 2 - row) * cell,
        0,
      ],
      centerOffset: [-cx, -cy, -cz],
      size: sizes[index],
    };
  });
}

/** Bounds enclosing every placed structure, used to frame the whole scene. */
export function overallBounds(placed: PlacedStructure[]): {
  center: [number, number, number];
  size: [number, number, number];
} {
  if (placed.length === 0) {
    return { center: [0, 0, 0], size: [1, 1, 1] };
  }

  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (const { position, size } of placed) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], position[axis] - size[axis] / 2);
      max[axis] = Math.max(max[axis], position[axis] + size[axis] / 2);
    }
  }

  return {
    center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
  };
}
