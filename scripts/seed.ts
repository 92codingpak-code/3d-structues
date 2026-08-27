/**
 * Seeds the `structures` table from public/models/manifest.json.
 *
 * Requires a real Supabase project: run the migration in
 * supabase/migrations/0001_init.sql first, then:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
 *
 * (or fill in .env.local and load it with `dotenv -e .env.local -- npx tsx scripts/seed.ts`)
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Manifest } from "../src/types/manifest";

// The manifest doesn't carry region/year_level (BodyParts3D's parts_list_e.txt
// only maps FMA ID -> English name) so it's tracked here for the test set.
// Extend this as more structures are added to the pipeline.
const STRUCTURE_METADATA: Record<string, { region: string; yearLevel: 1 | 2 }> = {
  FMA24475: { region: "lower limb", yearLevel: 1 }, // left femur
  FMA23131: { region: "upper limb", yearLevel: 1 }, // left humerus
  FMA24481: { region: "lower limb", yearLevel: 1 }, // left fibula
  FMA7857: { region: "thorax", yearLevel: 1 }, // right 1st rib
  FMA9248: { region: "vertebral column", yearLevel: 1 }, // T4 vertebra
  FMA16587: { region: "pelvis", yearLevel: 1 }, // left hip bone
};

const SYSTEM = "skeletal";

function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
  }

  const manifestPath = path.resolve(__dirname, "../public/models/manifest.json");
  const manifest: Manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

  const rows = manifest.map((entry) => {
    const metadata = STRUCTURE_METADATA[entry.fmaId];
    if (!metadata) {
      throw new Error(
        `No region/year_level metadata for ${entry.fmaId} in STRUCTURE_METADATA — add an entry to scripts/seed.ts.`
      );
    }
    return {
      fma_id: entry.fmaId,
      name_en: entry.name,
      system: SYSTEM,
      region: metadata.region,
      year_level: metadata.yearLevel,
      storage_path: `models/${entry.filename}`,
      triangle_count: entry.triangleCount,
    };
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  supabase
    .from("structures")
    .upsert(rows, { onConflict: "fma_id" })
    .select()
    .then(({ data, error }) => {
      if (error) {
        console.error("seed failed:", error.message);
        process.exit(1);
      }
      console.log(`seeded ${data?.length ?? 0} structures`);
    });
}

main();
