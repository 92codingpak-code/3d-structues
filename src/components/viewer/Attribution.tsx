/**
 * Required by the BodyParts3D CC BY-SA 2.1 Japan licence — this string must
 * stay visible in the app UI. Do not reword it.
 */
export const BODYPARTS3D_ATTRIBUTION =
  "BodyParts3D, © The Database Center for Life Science, licensed CC BY-SA 2.1 Japan";

export function Attribution() {
  return (
    <p className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 px-4 py-3 text-center text-[11px] leading-relaxed text-zinc-400/90">
      {BODYPARTS3D_ATTRIBUTION}
    </p>
  );
}
