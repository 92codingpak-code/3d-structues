"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import gsap from "gsap";
import { overallBounds, type PlacedStructure } from "@/lib/three/layout";

interface CameraRigProps {
  placed: PlacedStructure[];
  selectedFmaId: string | null;
}

const TWEEN_DURATION = 0.85;
/** Leaves a margin around the framed structure so it does not touch the edges. */
const FRAMING_MARGIN = 1.5;

/**
 * Tweens the camera to frame the selected structure, and back out to the whole
 * scene when nothing is selected.
 *
 * The framing is computed from the manifest's bounding boxes and the layout
 * rather than from the loaded meshes, so a selection made before a model has
 * finished streaming in still lands in the right place.
 */
export function CameraRig({ placed, selectedFmaId }: CameraRigProps) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  // Populated by <OrbitControls makeDefault />; null on the first frame.
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    if (!controls || placed.length === 0) return;

    const focus = selectedFmaId
      ? placed.find((item) => item.entry.fmaId === selectedFmaId)
      : undefined;
    const { center, size } = focus
      ? { center: focus.position, size: focus.size }
      : overallBounds(placed);

    const target = new Vector3(...center);

    // Distance at which the larger of the structure's width/height just fits
    // the frustum, whichever constraint binds first.
    const fov = (camera.fov * Math.PI) / 180;
    const fitHeightDistance = Math.max(size[1], size[2]) / 2 / Math.tan(fov / 2);
    const fitWidthDistance = size[0] / 2 / Math.tan(fov / 2) / camera.aspect;
    const distance = Math.max(fitHeightDistance, fitWidthDistance) * FRAMING_MARGIN;

    // Approach along the current viewing direction so the user keeps the
    // orientation they orbited to; fall back to a slight down-angle at start.
    const direction = camera.position.clone().sub(controls.target);
    if (direction.lengthSq() < 1e-6) direction.set(0, 0.25, 1);
    const end = target.clone().add(direction.normalize().multiplyScalar(distance));

    const proxy = {
      px: camera.position.x,
      py: camera.position.y,
      pz: camera.position.z,
      tx: controls.target.x,
      ty: controls.target.y,
      tz: controls.target.z,
    };

    const tween = gsap.to(proxy, {
      duration: TWEEN_DURATION,
      ease: "power3.inOut",
      px: end.x,
      py: end.y,
      pz: end.z,
      tx: target.x,
      ty: target.y,
      tz: target.z,
      onUpdate: () => {
        camera.position.set(proxy.px, proxy.py, proxy.pz);
        controls.target.set(proxy.tx, proxy.ty, proxy.tz);
        controls.update();
      },
    });

    return () => {
      tween.kill();
    };
  }, [selectedFmaId, placed, camera, controls]);

  return null;
}
