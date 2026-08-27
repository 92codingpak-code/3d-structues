/**
 * The .glb files produced by scripts/process_assets.py are Draco-compressed,
 * so GLTFLoader needs a Draco decoder to read them.
 *
 * The decoder is self-hosted from public/draco/ (copied out of
 * three/examples/jsm/libs/draco/gltf/) rather than pulled from Google's CDN:
 * the target audience is on mid-range Android phones on Pakistani networks,
 * where an extra third-party origin is an avoidable round trip and an
 * avoidable point of failure.
 */
export const DRACO_DECODER_PATH = "/draco/";
