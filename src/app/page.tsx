import Link from "next/link";
import { SKELETAL_REGIONS } from "@/lib/anatomy/taxonomy";
import { totalStructureCount } from "@/lib/structures/repository";

export default function Home() {
  const structureCount = totalStructureCount();
  const groupCount = SKELETAL_REGIONS.reduce(
    (total, region) => total + region.groups.length,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Learn skeletal anatomy for OSPE
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
        Rotate real 3D bone models, work region by region, and practise
        identifying structures the way an OSPE station asks you to. Free, and
        built to run on a mid-range phone.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/skeletal"
          className="rounded-md bg-amber-400/90 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-amber-300"
        >
          Browse the skeleton
        </Link>
        <span
          className="cursor-not-allowed rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-600"
          title="Not built yet"
        >
          OSPE practice — coming soon
        </span>
      </div>

      <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 text-center">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
            Models ready
          </dt>
          <dd className="mt-1 text-lg font-medium text-zinc-100">
            {structureCount}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
            Regions
          </dt>
          <dd className="mt-1 text-lg font-medium text-zinc-100">
            {SKELETAL_REGIONS.length}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-zinc-500">
            Groups mapped
          </dt>
          <dd className="mt-1 text-lg font-medium text-zinc-100">
            {groupCount}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-xs leading-relaxed text-zinc-600">
        The skeleton is fully mapped out, but only {structureCount} models are
        processed so far. Groups without models are shown greyed out as you
        browse, so you can see what is still to come.
      </p>
    </div>
  );
}
