"use client";

import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import type { StructureVisualState } from "@/lib/three/bone-material";
import type { PlacedStructure } from "@/lib/three/layout";
import { CameraRig } from "./CameraRig";
import { LoadingFallback } from "./LoadingFallback";
import { StructureModel } from "./StructureModel";

interface SceneProps {
  placed: PlacedStructure[];
  selectedFmaId: string | null;
  onSelect: (fmaId: string) => void;
}

function visualStateFor(fmaId: string, selectedFmaId: string | null): StructureVisualState {
  if (selectedFmaId === null) return "default";
  return selectedFmaId === fmaId ? "selected" : "dimmed";
}

export function Scene({ placed, selectedFmaId, onSelect }: SceneProps) {
  return (
    <>
      <color attach="background" args={["#0d1117"]} />

      {/* Bone needs a soft fill so the recesses do not go black, plus a key
          light for form and a cool rim light to separate it from the
          background. */}
      <ambientLight intensity={0.5} />
      <hemisphereLight args={["#fff6e8", "#33383f", 0.6]} />
      <directionalLight position={[6, 9, 7]} intensity={1.6} />
      <directionalLight position={[-7, 2, -6]} intensity={0.55} color="#9dbcff" />

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />

      {placed.map((item) => (
        <Suspense key={item.entry.fmaId} fallback={<LoadingFallback placed={item} />}>
          <StructureModel
            placed={item}
            visualState={visualStateFor(item.entry.fmaId, selectedFmaId)}
            onSelect={onSelect}
          />
        </Suspense>
      ))}

      <CameraRig placed={placed} selectedFmaId={selectedFmaId} />
    </>
  );
}
