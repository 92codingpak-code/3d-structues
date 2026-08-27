import type { PlacedStructure } from "@/lib/three/layout";

/**
 * Per-model Suspense fallback. Lives inside the Canvas, so it has to be a 3D
 * object rather than DOM — a wireframe box at the structure's slot, sized to
 * its bounding box, so the layout does not jump when the real mesh arrives.
 */
export function LoadingFallback({ placed }: { placed: PlacedStructure }) {
  return (
    <mesh position={placed.position}>
      <boxGeometry args={placed.size} />
      <meshBasicMaterial color="#55606f" wireframe transparent opacity={0.35} />
    </mesh>
  );
}
