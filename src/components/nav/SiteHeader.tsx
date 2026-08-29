import Link from "next/link";

/**
 * Fixed-height header. The viewer route sizes its canvas against
 * `100dvh - HEADER_HEIGHT`, so this height is shared rather than guessed.
 */
export const HEADER_HEIGHT_REM = 3.5;

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0d1117]/95 px-4 backdrop-blur sm:px-6"
      style={{ height: `${HEADER_HEIGHT_REM}rem` }}
    >
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-sm font-semibold tracking-tight text-zinc-100">
          Anatomy OSPE Trainer
        </span>
        <span className="hidden text-[11px] text-zinc-500 sm:inline">
          Skeletal system
        </span>
      </Link>

      <nav className="flex items-center gap-1 text-xs">
        <Link
          href="/skeletal"
          className="rounded-md px-3 py-1.5 text-zinc-300 transition-colors hover:bg-white/5 hover:text-zinc-100"
        >
          Browse
        </Link>
        <span
          className="cursor-not-allowed rounded-md px-3 py-1.5 text-zinc-600"
          title="Not built yet"
        >
          OSPE practice
        </span>
      </nav>
    </header>
  );
}
