import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { BrowseCard } from "@/components/ui/BrowseCard";
import {
  DIVISION_LABELS,
  regionsByDivision,
  type Division,
} from "@/lib/anatomy/taxonomy";
import { countsByRegion } from "@/lib/structures/repository";

export const metadata: Metadata = {
  title: "Skeletal system — Anatomy OSPE Trainer",
};

const DIVISIONS: Division[] = ["axial", "appendicular"];

export default function SkeletalPage() {
  const counts = countsByRegion();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Skeletal" }]} />

      <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-100">
        Skeletal system
      </h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        Pick a region. Models load only when you open a group, so nothing is
        downloaded until you need it.
      </p>

      {DIVISIONS.map((division) => (
        <section key={division} className="mt-10">
          <h2 className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            {DIVISION_LABELS[division]}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {regionsByDivision(division).map((region) => (
              <BrowseCard
                key={region.slug}
                href={`/skeletal/${region.slug}`}
                name={region.name}
                blurb={region.blurb}
                count={counts[region.slug] ?? 0}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
