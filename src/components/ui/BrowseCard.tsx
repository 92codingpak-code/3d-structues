import Link from "next/link";

interface BrowseCardProps {
  href: string;
  name: string;
  blurb: string;
  count: number;
}

/**
 * A region or group tile. Groups with no processed models yet still render,
 * greyed out — the taxonomy doubles as the content roadmap, so hiding empty
 * groups would hide what is left to build.
 */
export function BrowseCard({ href, name, blurb, count }: BrowseCardProps) {
  const available = count > 0;

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`text-sm font-medium ${available ? "text-zinc-100" : "text-zinc-500"}`}
        >
          {name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            available
              ? "bg-amber-400/10 text-amber-200/90"
              : "bg-white/5 text-zinc-600"
          }`}
        >
          {available ? `${count} model${count === 1 ? "" : "s"}` : "not yet"}
        </span>
      </div>
      <p
        className={`mt-1.5 text-xs leading-relaxed ${available ? "text-zinc-400" : "text-zinc-600"}`}
      >
        {blurb}
      </p>
    </>
  );

  if (!available) {
    return (
      <div
        aria-disabled
        className="cursor-not-allowed rounded-lg border border-white/5 bg-white/[0.02] p-4"
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-amber-400/30 hover:bg-white/[0.06]"
    >
      {body}
    </Link>
  );
}
