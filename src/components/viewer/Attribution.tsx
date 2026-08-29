/**
 * Required by the BodyParts3D CC BY-SA 2.1 Japan licence — this string must
 * stay visible in the app UI. Do not reword it.
 *
 * Rendered once, in the root layout, so it appears on every route.
 */
export const BODYPARTS3D_ATTRIBUTION =
  "BodyParts3D, © The Database Center for Life Science, licensed CC BY-SA 2.1 Japan";

export function Attribution() {
  return (
    <footer className="border-t border-white/5 px-4 py-4 text-center text-[11px] leading-relaxed text-zinc-500">
      {BODYPARTS3D_ATTRIBUTION}
    </footer>
  );
}
