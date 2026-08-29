import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="transition-colors hover:text-zinc-300"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? "text-zinc-300" : undefined}>
                  {crumb.label}
                </span>
              )}
              {!isLast && <span aria-hidden className="text-zinc-700">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
