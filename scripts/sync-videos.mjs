import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { format, resolveConfig } from "prettier";
import ts from "typescript";

const encoder = fileURLToPath(new URL("./encode-video.mjs", import.meta.url));
const origin = "https://media.svenfinger.com";
const sizes = ["small", "medium", "large"];
const usage = `Usage: pnpm video:sync <project-slug> [masters-directory]

Defaults to video-masters/<project-slug>. Name masters to match their video
on the page, for example cover.mp4 and detail.mp4. Supported inputs: MP4, MOV, WebM.

Encodes changed videos, uploads all variants to the website R2 bucket, and updates
the case study after every upload succeeds. Filenames are versioned automatically.
The website itself is not deployed by this command.`;

function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: "8404231482728ec9a41a6f72bec7a4ea",
    },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `${command} failed.`);
  }
  return result.stdout;
}

function videoAttributes(tag) {
  const source = ts.createSourceFile(
    "video.tsx",
    tag,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const node = source.statements[0]?.expression;
  if (
    source.parseDiagnostics.length ||
    !node ||
    !ts.isJsxSelfClosingElement(node)
  ) {
    throw new Error("Video components must use a valid self-closing JSX tag.");
  }
  return {
    source,
    attributes: new Map(
      node.attributes.properties
        .filter(ts.isJsxAttribute)
        .map((attribute) => [attribute.name.getText(source), attribute]),
    ),
  };
}

export function findVideoBlocks(content, slug) {
  const blocks = [];
  const tags = /<(WorkCover|WorkMedia)\b(?:[^"'<>]|"[^"]*"|'[^']*')*\/>/g;
  for (const match of content.matchAll(tags)) {
    const tag = match[0];
    const { attributes } = videoAttributes(tag);
    const type = attributes.get("type")?.initializer;
    if (!type || !ts.isStringLiteral(type) || type.text !== "video") continue;
    const initializer = attributes.get("src")?.initializer;
    const source =
      initializer && ts.isStringLiteral(initializer)
        ? initializer.text
        : undefined;
    if (!source) continue;
    let filename = source;
    if (source.startsWith("https://")) {
      const url = new URL(source);
      if (url.origin !== origin || !url.pathname.startsWith(`/work/${slug}/`)) {
        continue;
      }
      filename = url.pathname.slice(`/work/${slug}/`.length);
    }
    if (filename.includes("/")) continue;
    const name = filename
      .replace(/\.(mp4|mov|webm)$/i, "")
      .replace(/-(?:v\d+|[a-f0-9]{16})-(?:small|medium|large)$/, "");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) continue;
    blocks.push({ name, tag, component: match[1], index: match.index });
  }
  return blocks;
}

export function updateVideoBlock(block, sources, dimensions) {
  const { source, attributes } = videoAttributes(block.tag);
  const replacements = new Map([
    ["src", `src="${sources.small}"`],
    [
      "videoSources",
      `videoSources={{
    medium: "${sources.medium}",
    large: "${sources.large}",
  }}`,
    ],
  ]);
  const videoSources = attributes.get("videoSources")?.initializer;
  if (
    videoSources &&
    (!ts.isJsxExpression(videoSources) ||
      !videoSources.expression ||
      !ts.isObjectLiteralExpression(videoSources.expression))
  ) {
    throw new Error(`Use an inline videoSources object for ${block.name}.`);
  }
  if (block.component === "WorkMedia") {
    for (const attribute of ["width", "height"]) {
      const initializer = attributes.get(attribute)?.initializer;
      if (
        initializer &&
        (!ts.isJsxExpression(initializer) ||
          !initializer.expression ||
          !ts.isNumericLiteral(initializer.expression))
      ) {
        throw new Error(`Use a numeric ${attribute} for ${block.name}.`);
      }
      replacements.set(attribute, `${attribute}={${dimensions[attribute]}}`);
    }
  }
  let tag = block.tag;
  for (const attribute of [...attributes.values()].reverse()) {
    const replacement = replacements.get(attribute.name.getText(source));
    if (!replacement) continue;
    tag =
      tag.slice(0, attribute.getStart(source)) +
      replacement +
      tag.slice(attribute.end);
    replacements.delete(attribute.name.getText(source));
  }
  if (replacements.size) {
    tag = tag.replace(
      /\/>$/,
      `\n  ${[...replacements.values()].join("\n  ")}\n/>`,
    );
  }
  return tag;
}

function videoDimensions(input) {
  return JSON.parse(
    run(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "json",
        input,
      ],
      true,
    ),
  ).streams[0];
}

async function syncVideos() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { help: { type: "boolean" } },
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  if (positionals.length < 1 || positionals.length > 2) {
    throw new Error(usage);
  }
  const [slug, mastersPath = `video-masters/${slug}`] = positionals;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Provide a project slug, such as flip-absences.");
  }
  const contentPath = path.resolve(`src/content/work/${slug}.mdx`);
  const content = readFileSync(contentPath, "utf8");
  const blocks = findVideoBlocks(content, slug);
  const directory = path.resolve(mastersPath);
  const masters = readdirSync(directory, { withFileTypes: true }).filter(
    (entry) => entry.isFile() && /\.(mp4|mov|webm)$/i.test(entry.name),
  );
  if (!masters.length)
    throw new Error(`No video masters found in ${directory}.`);

  const encoderVersion = `${readFileSync(encoder, "utf8")}\n${run("ffmpeg", ["-version"], true)}`;
  const names = new Set();
  const jobs = masters.map((master) => {
    const name = path.parse(master.name).name;
    if (names.has(name))
      throw new Error(`More than one master is named ${name}.`);
    names.add(name);
    const matches = blocks.filter((block) => block.name === name);
    if (!matches.length) {
      throw new Error(
        `No matching video on ${slug} for ${master.name}. Use src="${master.name}" on a WorkCover or WorkMedia with type="video".`,
      );
    }
    const widths = matches.some((block) => block.component === "WorkMedia")
      ? "1280,1920,2560"
      : "1120,1680,2240";
    const input = path.join(directory, master.name);
    const hash = createHash("sha256")
      .update(readFileSync(input))
      .update(encoderVersion)
      .update(widths)
      .digest("hex")
      .slice(0, 16);
    const prefix = `${name}-${hash}`;
    const sources = Object.fromEntries(
      sizes.map((size) => [
        size,
        `${origin}/work/${slug}/${prefix}-${size}.mp4`,
      ]),
    );
    // Validate editable attributes before encoding or uploading anything.
    for (const block of matches) {
      updateVideoBlock(block, sources, { width: 2, height: 2 });
    }
    return { name, input, widths, prefix, sources, matches };
  });
  const changed = jobs.filter((job) => {
    const current = job.matches.every((block) =>
      sizes.every((size) => block.tag.includes(`"${job.sources[size]}"`)),
    );
    if (current) console.log(`${job.name}: unchanged, skipped.`);
    return !current;
  });
  if (!changed.length) return;

  run("pnpm", ["exec", "wrangler", "whoami"]);
  const outputRoot = path.resolve(`video-output/${slug}`);
  mkdirSync(outputRoot, { recursive: true });
  const replacements = new Map();
  for (const job of changed) {
    const output = path.join(outputRoot, job.prefix);
    if (!existsSync(output)) {
      const temporary = mkdtempSync(path.join(outputRoot, ".encoding-"));
      try {
        run(process.execPath, [
          encoder,
          job.input,
          temporary,
          "--name",
          job.prefix,
          "--widths",
          job.widths,
        ]);
        renameSync(temporary, output);
      } finally {
        rmSync(temporary, { recursive: true, force: true });
      }
    } else {
      console.log(`${job.name}: reusing completed encodes.`);
    }
    const dimensions = videoDimensions(
      path.join(output, `${job.prefix}-large.mp4`),
    );
    for (const size of sizes) {
      const filename = `${job.prefix}-${size}.mp4`;
      run("pnpm", [
        "exec",
        "wrangler",
        "r2",
        "object",
        "put",
        `website/work/${slug}/${filename}`,
        "--remote",
        "--file",
        path.join(output, filename),
        "--content-type",
        "video/mp4",
        "--cache-control",
        "public, max-age=31536000, immutable",
      ]);
    }
    for (const block of job.matches) {
      replacements.set(
        block.index,
        updateVideoBlock(block, job.sources, dimensions),
      );
    }
  }
  let updated = content;
  for (const block of [...blocks].reverse()) {
    if (!replacements.has(block.index)) continue;
    updated =
      updated.slice(0, block.index) +
      replacements.get(block.index) +
      updated.slice(block.index + block.tag.length);
  }
  updated = await format(updated, {
    ...(await resolveConfig(contentPath)),
    filepath: contentPath,
  });
  if (readFileSync(contentPath, "utf8") !== content) {
    throw new Error(
      "The case study changed during processing. Run again to update it safely.",
    );
  }
  const temporaryContent = `${contentPath}.video-sync.tmp`;
  try {
    writeFileSync(temporaryContent, updated);
    renameSync(temporaryContent, contentPath);
  } finally {
    rmSync(temporaryContent, { force: true });
  }
  console.log(
    `Updated ${contentPath}. Ready to preview and deploy through your usual workflow.`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  syncVideos().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
