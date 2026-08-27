"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { layoutStructures } from "@/lib/three/layout";
import type { Manifest } from "@/types/manifest";
import { Attribution } from "./Attribution";
import { Scene } from "./Scene";

interface ViewerProps {
  manifestUrl?: string;
}

export function Viewer({ manifestUrl = "/models/manifest.json" }: ViewerProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFmaId, setSelectedFmaId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(manifestUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        return response.json() as Promise<Manifest>;
      })
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(
          `Could not load ${manifestUrl} (${cause instanceof Error ? cause.message : "unknown error"}). Run the asset pipeline first — see README.`
        );
      });

    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  const placed = useMemo(
    () => (manifest ? layoutStructures(manifest) : []),
    [manifest]
  );

  return (
    // h-dvh rather than a percentage/flex chain: the canvas needs a definite
    // height to size against, and dvh tracks the collapsing browser chrome on
    // mobile so the viewer stays full-bleed.
    <div className="relative h-dvh w-full overflow-hidden bg-[#0d1117]">
      {error && (
        <p className="absolute inset-x-0 top-0 z-10 px-4 py-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      {!error && !manifest && (
        <p className="absolute inset-0 z-10 flex items-center justify-center text-sm text-zinc-400">
          Loading structures…
        </p>
      )}

      {placed.length > 0 && (
        <div className="absolute inset-0">
          <Canvas
            // r3f refuses to create its root until the container measures
            // non-zero, and the default debounced/scroll-aware measurement can
            // miss its first observation and leave a permanently blank canvas.
            resize={{ scroll: false, debounce: 0 }}
            // Cap the pixel ratio: mid-range Android phones report a DPR of 3+,
            // and rendering at that resolution is the single biggest frame-rate
            // cost in a scene this simple.
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            // Scene units are metres (see MM_TO_M in scripts/process_assets.py):
            // a femur is ~0.44 long and the whole grid spans a couple of units.
            // CameraRig retargets on mount, so this is just a sane starting point.
            camera={{ position: [0, 0, 2], fov: 45, near: 0.01, far: 100 }}
            // Clicking empty space clears the selection.
            onPointerMissed={() => setSelectedFmaId(null)}
          >
            <Scene
              placed={placed}
              selectedFmaId={selectedFmaId}
              onSelect={setSelectedFmaId}
            />
          </Canvas>
        </div>
      )}

      <Attribution />
    </div>
  );
}
