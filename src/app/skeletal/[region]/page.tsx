import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { BrowseCard } from "@/components/ui/BrowseCard";
import { SKELETAL_REGIONS, getRegion } from "@/lib/anatomy/taxonomy";
import { countsByGroup } from "@/lib/structures/repository";

// The taxonomy is static, so every region page is prerendered at build time.
export function generateStaticParams() {
  return SKELETAL_REGIONS.map((region) => ({ region: region.slug }));
}

export async function generateMetadata(
  props: PageProps<"/skeletal/[region]">
): Promise<Metadata> {
  const { region: regionSlug } = await props.params;
  const region = getRegion(regionSlug);
  return {
    title: region
      ? `${region.name} — Anatomy OSPE Trainer`
      : "Not found — Anatomy OSPE Trainer",
  };
}

export default async function RegionPage(
  props: PageProps<"/skeletal/[region]">
) {
  const { region: regionSlug } = await props.params;
  const region = getRegion(regionSlug);
  if (!region) notFound();

  const counts = countsByGroup();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs
        trail={[
          { label: "Home", href: "/" },
          { label: "Skeletal", href: "/skeletal" },
          { label: region.name },
        ]}
      />

      <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-100">
        {region.name}
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        {region.blurb}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {region.groups.map((group) => (
          <BrowseCard
            key={group.slug}
            href={`/skeletal/${region.slug}/${group.slug}`}
            name={group.name}
            blurb={group.blurb}
            count={counts[`${region.slug}/${group.slug}`] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
