export type YearLevel = 1 | 2;

export interface Structure {
  id: string;
  fma_id: string;
  name_en: string;
  system: string;
  region: string | null;
  year_level: YearLevel;
  storage_path: string;
  triangle_count: number;
  created_at: string;
}

export interface StructureRelation {
  parent_id: string;
  child_id: string;
}
