"use client";

import { useEffect, useMemo } from "react";
import type { Mesh, BufferGeometry } from "three";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { boneMaterialProps, type StructureVisualState } from "@/lib/three/bone-material";
import { DRACO_DECODER_PATH } from "@/lib/three/draco";
import type { PlacedStructure } from "@/lib/three/layout";

interface StructureModelProps {
  placed: PlacedStructure;
  visualState: StructureVisualState;
  onSelect: (fmaId: string) => void;
}

export function StructureModel({ placed, visualState, onSelect }: StructureModelProps) {
  const { entry, position, centerOffset } = placed;

  // Suspends until the .glb is fetched and decoded. Each StructureModel sits
  // in its own Suspense boundary, so models stream in one at a time instead
  // of the whole set blocking on the slowest download.
  const { scene } = useGLTF(`/models/${entry.filename}`, DRACO_DECODER_PATH);

  // Draw the geometry with our own material rather than the one baked into
  // the .glb, so selection state controls appearance. A BodyParts3D export
  // is usually a single mesh, but split meshes survive this too.
  const geometries = useMemo(() => {
    const found: BufferGeometry[] = [];
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (mesh.isMesh) found.push(mesh.geometry);
    });
    return found;
  }, [scene]);

  useEffect(() => () => {
    document.body.style.cursor = "auto";
  }, []);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Without this the click also hits whatever is behind this bone.
    event.stopPropagation();
    onSelect(entry.fmaId);
  };

  const materialProps = boneMaterialProps(visualState);

  return (
    <group position={position}>
      <group position={centerOffset}>
        {geometries.map((geometry, index) => (
          <mesh
            key={index}
            geometry={geometry}
            onClick={handleClick}
            onPointerOver={() => {
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "auto";
            }}
          >
            <meshStandardMaterial key={visualState} {...materialProps} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
