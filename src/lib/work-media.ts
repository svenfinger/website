import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(process.cwd(), "public/images/work");
const IMAGE_EXT = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const VIDEO_EXT = new Set([".mov", ".mp4", ".webm"]);

export type WorkMedia = {
  src: string;
  type: "image" | "video";
};

function mediaType(filename: string): WorkMedia["type"] | null {
  const ext = path.extname(filename).toLowerCase();
  if (VIDEO_EXT.has(ext)) {
    return "video";
  }
  if (IMAGE_EXT.has(ext)) {
    return "image";
  }
  return null;
}

function listWorkFiles(slug: string) {
  return fs
    .readdirSync(path.join(WORK_DIR, slug))
    .sort((a, b) => a.localeCompare(b));
}

function toMedia(slug: string, filename: string): WorkMedia | null {
  const type = mediaType(filename);
  if (!type) {
    return null;
  }

  return {
    src: `/images/work/${slug}/${filename}`,
    type,
  };
}

function isCover(filename: string) {
  return /^.+-cover\.[^.]+$/.test(filename);
}

function isGalleryFile(filename: string) {
  return !isCover(filename) && !filename.includes("social-preview");
}

export function getWorkCover(slug: string): WorkMedia {
  const cover = listWorkFiles(slug)
    .map((filename) => (isCover(filename) ? toMedia(slug, filename) : null))
    .find(Boolean);

  if (!cover) {
    throw new Error(`Missing cover media in public/images/work/${slug}`);
  }

  return cover;
}

export function getWorkGallery(slug: string): WorkMedia[] {
  return listWorkFiles(slug).flatMap((filename) => {
    if (!isGalleryFile(filename)) {
      return [];
    }

    const media = toMedia(slug, filename);
    return media ? [media] : [];
  });
}
