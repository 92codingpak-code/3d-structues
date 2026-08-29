import type { Division } from "./taxonomy";

/**
 * Where each structure sits in the taxonomy, plus its curriculum year.
 *
 * BodyParts3D's `parts_list_e.txt` only maps FMA ID to an English name — it
 * carries no regional or curriculum information — so this mapping has to be
 * authored. It is the single source of truth shared by the seed script
 * (which writes it to Supabase) and the local manifest fallback (which reads
 * it when Supabase is not configured).
 *
 * Add an entry here whenever you add an FMA ID to the asset pipeline.
 */
export interface StructurePlacement {
  regionSlug: string;
  groupSlug: string;
  division: Division;
  yearLevel: 1 | 2;
}

export const STRUCTURE_PLACEMENT: Record<string, StructurePlacement> = {
  FMA24475: { regionSlug: "lower-limb", groupSlug: "thigh", division: "appendicular", yearLevel: 1 }, // left femur
  FMA24481: { regionSlug: "lower-limb", groupSlug: "leg", division: "appendicular", yearLevel: 1 }, // left fibula
  FMA23131: { regionSlug: "upper-limb", groupSlug: "arm", division: "appendicular", yearLevel: 1 }, // left humerus
  FMA16587: { regionSlug: "pelvic-girdle", groupSlug: "hip-bone", division: "appendicular", yearLevel: 1 }, // left hip bone
  FMA7857: { regionSlug: "thorax", groupSlug: "ribs", division: "axial", yearLevel: 1 }, // right first rib
  FMA9248: { regionSlug: "vertebral-column", groupSlug: "thoracic", division: "axial", yearLevel: 1 }, // fourth thoracic vertebra
};

export function getPlacement(fmaId: string): StructurePlacement | undefined {
  return STRUCTURE_PLACEMENT[fmaId];
}
