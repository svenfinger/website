import fs from "node:fs";
import path from "node:path";

const WORK_DIR = path.join(process.cwd(), "public/images/work");
const IMAGE_EXT = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const VIDEO_EXT = new Set([".mov", ".mp4", ".webm"]);

export type WorkMedia = {
  src: string;
  type: "image" | "video";
  width?: number;
  height?: number;
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

  const filePath = path.join(WORK_DIR, slug, filename);
  const size = readMediaSize(filePath, type);

  return {
    src: `/images/work/${slug}/${filename}`,
    type,
    ...size,
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

export function workMediaAlt(
  title: string,
  src: string,
  kind: "cover" | "gallery",
) {
  if (kind === "cover") {
    return title;
  }

  const filename = src.split("/").pop() ?? "";
  const slug = src.split("/").at(-2) ?? "";
  const stem = filename.replace(/\.[^.]+$/, "");
  const rest = stem.startsWith(`${slug}-`) ? stem.slice(slug.length + 1) : stem;
  const label = rest.replaceAll("-", " ");

  if (!label || label === "cover") {
    return title;
  }

  return `${title}, ${label}`;
}

function readMediaSize(filePath: string, type: WorkMedia["type"]) {
  if (type === "image") {
    return readImageSize(filePath);
  }

  const sibling = [...IMAGE_EXT]
    .map((ext) => filePath.replace(/\.[^.]+$/, ext))
    .find((candidate) => candidate !== filePath && fs.existsSync(candidate));

  if (sibling) {
    return readImageSize(sibling);
  }

  return readMp4Size(filePath);
}

function readImageSize(filePath: string) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".png") {
    return pngSize(buffer);
  }
  if (ext === ".gif") {
    return gifSize(buffer);
  }
  if (ext === ".webp") {
    return webpSize(buffer);
  }
  if (ext === ".jpg" || ext === ".jpeg") {
    return jpegSize(buffer);
  }

  return undefined;
}

function pngSize(buffer: Buffer) {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    return undefined;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function gifSize(buffer: Buffer) {
  if (buffer.length < 10 || buffer.toString("ascii", 0, 3) !== "GIF") {
    return undefined;
  }

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function webpSize(buffer: Buffer) {
  if (
    buffer.length < 30 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return undefined;
  }

  const chunk = buffer.toString("ascii", 12, 16);

  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: (buffer.readUIntLE(24, 3) & 0xffffff) + 1,
      height: (buffer.readUIntLE(27, 3) & 0xffffff) + 1,
    };
  }

  if (chunk === "VP8 " && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  return undefined;
}

function jpegSize(buffer: Buffer) {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;

  while (offset + 8 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    if (marker >= 0xc0 && marker <= 0xc2) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      offset += 2;
      continue;
    }

    if (marker === 0xd9) {
      break;
    }

    offset += 2 + buffer.readUInt16BE(offset + 2);
  }

  return undefined;
}

function readMp4Size(filePath: string) {
  if (path.extname(filePath).toLowerCase() !== ".mp4") {
    return undefined;
  }

  const buffer = fs.readFileSync(filePath);
  return walkMp4(buffer, 0, buffer.length);
}

function walkMp4(buffer: Buffer, start: number, end: number) {
  let offset = start;

  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let header = 8;

    if (size === 1) {
      if (offset + 16 > end) {
        break;
      }
      size = Number(buffer.readBigUInt64BE(offset + 8));
      header = 16;
    }

    if (size < header || offset + size > end) {
      break;
    }

    if (type === "tkhd") {
      const sizeValue = tkhdSize(buffer, offset + header);
      if (sizeValue) {
        return sizeValue;
      }
    }

    if (type === "moov" || type === "trak" || type === "mdia") {
      const nested = walkMp4(buffer, offset + header, offset + size);
      if (nested) {
        return nested;
      }
    }

    offset += size;
  }

  return undefined;
}

function tkhdSize(buffer: Buffer, body: number) {
  if (body + 84 > buffer.length) {
    return undefined;
  }

  const version = buffer[body];
  const point = version === 1 ? body + 88 : body + 76;

  if (point + 8 > buffer.length) {
    return undefined;
  }

  const width = buffer.readUInt32BE(point) >> 16;
  const height = buffer.readUInt32BE(point + 4) >> 16;

  if (width < 1 || height < 1) {
    return undefined;
  }

  return { width, height };
}
