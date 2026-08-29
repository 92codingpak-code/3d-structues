/**
 * Seeds the `structures` table from public/models/manifest.json.
 *
 * Requires a real Supabase project: run the migrations in
 * supabase/migrations/ first, then:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts
 *
 * Taxonomy placement comes from src/lib/anatomy/structure-metadata.ts, the
 * same map the app reads, so the database and the route hierarchy cannot
 * drift apart.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { STRUCTURE_PLACEMENT } from "../src/lib/anatomy/structure-metadata";
import { getGroup } from "../src/lib/anatomy/taxonomy";
import type { Manifest } from "../src/types/manifest";

const SYSTEM = "skeletal";

async function main() {
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
    const placement = STRUCTURE_PLACEMENT[entry.fmaId];
    if (!placement) {
      throw new Error(
        `No placement for ${entry.fmaId} (${entry.name}) — add it to src/lib/anatomy/structure-metadata.ts.`
      );
    }

    // Catch a slug that does not exist in the taxonomy now, rather than as a
    // 404 when a student opens the region.
    const found = getGroup(placement.regionSlug, placement.groupSlug);
    if (!found) {
      throw new Error(
        `${entry.fmaId} is placed in "${placement.regionSlug}/${placement.groupSlug}", which is not in the taxonomy.`
      );
    }

    return {
      fma_id: entry.fmaId,
      name_en: entry.name,
      system: SYSTEM,
      region: found.region.name,
      region_slug: placement.regionSlug,
      group_slug: placement.groupSlug,
      division: placement.division,
      year_level: placement.yearLevel,
      storage_path: `models/${entry.filename}`,
      triangle_count: entry.triangleCount,
    };
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("structures")
    .upsert(rows, { onConflict: "fma_id" })
    .select();

  if (error) {
    console.error("seed failed:", error.message);
    process.exit(1);
  }

  console.log(`seeded ${data?.length ?? 0} structures`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
