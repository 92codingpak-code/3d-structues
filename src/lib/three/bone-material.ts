import type { ThreeElements } from "@react-three/fiber";

type MeshStandardMaterialProps = ThreeElements["meshStandardMaterial"];

export type StructureVisualState = "default" | "selected" | "dimmed";

/**
 * Bone reads best as a warm off-white that is mostly diffuse with a slight
 * sheen — high metalness makes it look like painted plastic.
 */
const BONE_BASE = {
  color: "#ded3bd",
  roughness: 0.7,
  metalness: 0.05,
} as const;

/**
 * Material props for a structure, given whether it is selected, dimmed
 * because something else is selected, or shown normally.
 *
 * Spread onto `<meshStandardMaterial>` with `key={visualState}` so that
 * toggling `transparent` recreates the material — mutating `transparent` on a
 * live material otherwise needs an explicit `needsUpdate`.
 */
export function boneMaterialProps(state: StructureVisualState): MeshStandardMaterialProps {
  switch (state) {
    case "selected":
      return {
        ...BONE_BASE,
        color: "#fff4dd",
        emissive: "#c98a2b",
        emissiveIntensity: 0.35,
        roughness: 0.55,
      };
    case "dimmed":
      return {
        ...BONE_BASE,
        transparent: true,
        opacity: 0.16,
        // Without this, dimmed bones occlude the selected one through the
        // depth buffer even though they are visually see-through.
        depthWrite: false,
      };
    default:
      return { ...BONE_BASE };
  }
}
