import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { GroupExplorer } from "@/components/viewer/GroupExplorer";
import { SKELETAL_REGIONS, getGroup } from "@/lib/anatomy/taxonomy";
import { getStructuresInGroup } from "@/lib/structures/repository";

export function generateStaticParams() {
  return SKELETAL_REGIONS.flatMap((region) =>
    region.groups.map((group) => ({
      region: region.slug,
      group: group.slug,
    }))
  );
}

export async function generateMetadata(
  props: PageProps<"/skeletal/[region]/[group]">
): Promise<Metadata> {
  const { region: regionSlug, group: groupSlug } = await props.params;
  const found = getGroup(regionSlug, groupSlug);
  return {
    title: found
      ? `${found.group.name} — ${found.region.name} — Anatomy OSPE Trainer`
      : "Not found — Anatomy OSPE Trainer",
  };
}

export default async function GroupPage(
  props: PageProps<"/skeletal/[region]/[group]">
) {
  const { region: regionSlug, group: groupSlug } = await props.params;
  const found = getGroup(regionSlug, groupSlug);
  if (!found) notFound();

  const { region, group } = found;

  // Only this group's structures cross into the client bundle — the rest of
  // the catalogue never leaves the server.
  const structures = getStructuresInGroup(region.slug, group.slug);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Breadcrumbs
        trail={[
          { label: "Home", href: "/" },
          { label: "Skeletal", href: "/skeletal" },
          { label: region.name, href: `/skeletal/${region.slug}` },
          { label: group.name },
        ]}
      />

      <div className="mt-4 mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
          {group.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{group.blurb}</p>
      </div>

      <GroupExplorer entries={structures} />
    </div>
  );
}
