/**
 * The anatomical taxonomy that drives routing, navigation, and the DB's
 * region/group slugs.
 *
 * This lives in code rather than the database on purpose: it is a fixed
 * classification that changes only when the curriculum does, and having it
 * statically available lets Next prerender every region and group page and
 * render navigation without a database round trip. The database stores which
 * *structures* exist and where they sit in this tree — that is the part that
 * grows.
 *
 * Groups are listed whether or not any models exist for them yet, so this
 * doubles as the content roadmap: the UI marks empty groups as unavailable
 * rather than hiding them.
 */

export type Division = "axial" | "appendicular";

export const DIVISION_LABELS: Record<Division, string> = {
  axial: "Axial skeleton",
  appendicular: "Appendicular skeleton",
};

export interface AnatomyGroup {
  slug: string;
  name: string;
  blurb: string;
}

export interface AnatomyRegion {
  slug: string;
  name: string;
  division: Division;
  blurb: string;
  groups: AnatomyGroup[];
}

export const SKELETAL_REGIONS: AnatomyRegion[] = [
  {
    slug: "skull",
    name: "Skull",
    division: "axial",
    blurb: "Cranial and facial bones, and the mandible.",
    groups: [
      { slug: "cranial-vault", name: "Cranial vault", blurb: "Frontal, parietal, occipital, temporal." },
      { slug: "cranial-base", name: "Cranial base", blurb: "Sphenoid, ethmoid, and the fossae." },
      { slug: "facial-bones", name: "Facial bones", blurb: "Maxilla, zygomatic, nasal, palatine." },
      { slug: "mandible", name: "Mandible", blurb: "The only mobile bone of the skull." },
    ],
  },
  {
    slug: "vertebral-column",
    name: "Vertebral column",
    division: "axial",
    blurb: "Cervical through coccygeal vertebrae.",
    groups: [
      { slug: "cervical", name: "Cervical vertebrae", blurb: "C1–C7, including atlas and axis." },
      { slug: "thoracic", name: "Thoracic vertebrae", blurb: "T1–T12, with costal facets." },
      { slug: "lumbar", name: "Lumbar vertebrae", blurb: "L1–L5, the weight-bearing segment." },
      { slug: "sacrum-coccyx", name: "Sacrum & coccyx", blurb: "Fused vertebrae of the pelvis." },
    ],
  },
  {
    slug: "thorax",
    name: "Thoracic cage",
    division: "axial",
    blurb: "The ribs and sternum enclosing the thoracic cavity.",
    groups: [
      { slug: "ribs", name: "Ribs", blurb: "True, false, and floating ribs." },
      { slug: "sternum", name: "Sternum", blurb: "Manubrium, body, xiphoid process." },
    ],
  },
  {
    slug: "pectoral-girdle",
    name: "Pectoral girdle",
    division: "appendicular",
    blurb: "The bones anchoring the upper limb to the axial skeleton.",
    groups: [
      { slug: "clavicle", name: "Clavicle", blurb: "The strut holding the shoulder laterally." },
      { slug: "scapula", name: "Scapula", blurb: "Glenoid, acromion, coracoid process." },
    ],
  },
  {
    slug: "upper-limb",
    name: "Upper limb",
    division: "appendicular",
    blurb: "Arm, forearm, and hand.",
    groups: [
      { slug: "arm", name: "Arm", blurb: "The humerus." },
      { slug: "forearm", name: "Forearm", blurb: "Radius and ulna." },
      { slug: "hand", name: "Hand", blurb: "Carpals, metacarpals, phalanges." },
    ],
  },
  {
    slug: "pelvic-girdle",
    name: "Pelvic girdle",
    division: "appendicular",
    blurb: "The hip bones and their articulation with the sacrum.",
    groups: [
      { slug: "hip-bone", name: "Hip bone", blurb: "Ilium, ischium, and pubis fused." },
    ],
  },
  {
    slug: "lower-limb",
    name: "Lower limb",
    division: "appendicular",
    blurb: "Thigh, leg, and foot.",
    groups: [
      { slug: "thigh", name: "Thigh", blurb: "Femur and patella." },
      { slug: "leg", name: "Leg", blurb: "Tibia and fibula." },
      { slug: "foot", name: "Foot", blurb: "Tarsals, metatarsals, phalanges." },
    ],
  },
];

export function getRegion(slug: string): AnatomyRegion | undefined {
  return SKELETAL_REGIONS.find((region) => region.slug === slug);
}

export function getGroup(
  regionSlug: string,
  groupSlug: string
): { region: AnatomyRegion; group: AnatomyGroup } | undefined {
  const region = getRegion(regionSlug);
  const group = region?.groups.find((candidate) => candidate.slug === groupSlug);
  return region && group ? { region, group } : undefined;
}

export function regionsByDivision(division: Division): AnatomyRegion[] {
  return SKELETAL_REGIONS.filter((region) => region.division === division);
}
