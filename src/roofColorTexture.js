import { textureLoader } from "./script";

/**
 * Roof
 * 2.5 is the height of the walls and 0.75 is half of the roof's height because
 * the cone's origin is at its center
 */
export const roofColorTexture = textureLoader.load(
  "./roof/ceramic_roof_01_1k/ceramic_roof_01_diff_1k.jpg",
);
