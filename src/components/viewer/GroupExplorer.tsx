"use client";

import { useState } from "react";
import type { ManifestEntry } from "@/types/manifest";
import { Viewer } from "./Viewer";

interface GroupExplorerProps {
  entries: ManifestEntry[];
}

/**
 * Owns selection for a group page so the 3D view and the structure list stay
 * in step: clicking a bone highlights its row, and clicking a row frames the
 * bone.
 */
export function GroupExplorer({ entries }: GroupExplorerProps) {
  const [selectedFmaId, setSelectedFmaId] = useState<string | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div className="h-[58vh] min-h-[380px] overflow-hidden rounded-lg border border-white/10 bg-black/20">
        <Viewer
          entries={entries}
          selectedFmaId={selectedFmaId}
          onSelect={setSelectedFmaId}
        />
      </div>

      <aside>
        <h2 className="px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Structures in this group
        </h2>

        {entries.length === 0 && (
          <p className="px-1 text-xs leading-relaxed text-zinc-600">
            Nothing here yet. Process this group&rsquo;s FMA IDs through the
            asset pipeline to add it.
          </p>
        )}
        <ul className="space-y-1">
          {entries.map((entry) => {
            const isSelected = entry.fmaId === selectedFmaId;
            return (
              <li key={entry.fmaId}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFmaId(isSelected ? null : entry.fmaId)
                  }
                  aria-pressed={isSelected}
                  className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? "border-amber-400/40 bg-amber-400/10 text-amber-100"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="block capitalize">{entry.name}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-zinc-500">
                    {entry.fmaId}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {entries.length > 0 && (
          <p className="px-1 pt-3 text-[11px] leading-relaxed text-zinc-600">
            Click a bone in the viewer or a name here to frame it. Click empty
            space to reset.
          </p>
        )}
      </aside>
    </div>
  );
}
