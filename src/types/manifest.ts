export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
}

export interface ManifestEntry {
  fmaId: string;
  name: string;
  filename: string;
  triangleCount: number;
  fileSizeBytes: number;
  boundingBox: BoundingBox;
}

export type Manifest = ManifestEntry[];
