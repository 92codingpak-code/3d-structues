"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { layoutStructures } from "@/lib/three/layout";
import type { ManifestEntry } from "@/types/manifest";
import { Scene } from "./Scene";

interface ViewerProps {
  /**
   * Exactly the structures this route should render. The server passes only
   * the current group's entries, so a student opening "Ribs" never downloads
   * the femur — and the payload does not grow as the catalogue does.
   */
  entries: ManifestEntry[];
  selectedFmaId: string | null;
  onSelect: (fmaId: string | null) => void;
}

export function Viewer({ entries, selectedFmaId, onSelect }: ViewerProps) {
  const placed = useMemo(() => layoutStructures(entries), [entries]);

  if (placed.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500">
        No models have been processed for this group yet.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Absolutely positioned so the canvas has a definite box to fill:
          r3f sizes itself with height:100% and will not create its root
          until the container measures non-zero. */}
      <div className="absolute inset-0">
        <Canvas
          // r3f's default debounced, scroll-aware measurement can miss its
          // first observation and leave a permanently blank canvas.
          resize={{ scroll: false, debounce: 0 }}
          // Cap the pixel ratio: mid-range Android phones report a DPR of 3+,
          // and rendering at that resolution is the single biggest frame-rate
          // cost in a scene this simple.
          dpr={[1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          // Scene units are metres (see MM_TO_M in scripts/process_assets.py):
          // a femur is ~0.44 long. CameraRig retargets on mount, so this is
          // just a sane starting point.
          camera={{ position: [0, 0, 2], fov: 45, near: 0.01, far: 100 }}
          onPointerMissed={() => onSelect(null)}
        >
          <Scene
            placed={placed}
            selectedFmaId={selectedFmaId}
            onSelect={onSelect}
          />
        </Canvas>
      </div>
    </div>
  );
}
