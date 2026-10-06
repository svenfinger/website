import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

const images = import.meta.glob<ImageMetadata>(
  "/public/images/**/*.{avif,jpeg,jpg,png,webp}",
  { import: "default" },
);

export async function getResponsiveImage(
  src: string,
  widths: number[],
  sizes: string,
) {
  const load = images[`/public${src}`];
  if (!load) return undefined;

  const image = await load();
  return getImage({
    src: image,
    width: Math.min(widths[1] ?? widths[0], image.width),
    widths,
    sizes,
    format: "webp",
    quality: 80,
  });
}
