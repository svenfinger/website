import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findVideoBlocks, updateVideoBlock } from "./sync-videos.mjs";

const script = fileURLToPath(new URL("./sync-videos.mjs", import.meta.url));
const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;

test("attribute-like text in an alt description is preserved", () => {
  const content = `<WorkMedia alt="Example width={2560} and src='other.mp4'" type="video" src="detail.mp4" width={1920} height={1080} />`;
  const blocks = findVideoBlocks(content, "example");
  assert.equal(blocks[0].name, "detail");
  const updated = updateVideoBlock(
    blocks[0],
    { small: "small.mp4", medium: "medium.mp4", large: "large.mp4" },
    { width: 64, height: 36 },
  );
  assert.ok(updated.includes(`alt="Example width={2560} and src='other.mp4'"`));
  assert.match(updated, /src="small.mp4"/);
  assert.match(updated, /width=\{64\}/);
  assert.match(updated, /height=\{36\}/);
});

const content = `---
title: Example
---

<WorkCover
  title="Example"
  category="Design"
  type="video"
  src="https://media.svenfinger.com/work/example/cover-v1-small.mp4"
  videoSources={{
    medium: "https://media.svenfinger.com/work/example/cover-v1-medium.mp4",
    large: "https://media.svenfinger.com/work/example/cover-v1-large.mp4",
  }}
  poster="/cover.jpg"
/>

Keep this case study text unchanged.

<WorkMedia
  type="video"
  src="detail.mp4"
  poster="/detail.jpg"
  alt="Requesting time off"
  width={2560}
  height={1440}
/>
`;

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), "video-sync-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const contentPath = path.join(root, "src/content/work/example.mdx");
  const masters = path.join(root, "video-masters/example");
  const bin = path.join(root, "bin");
  mkdirSync(path.dirname(contentPath), { recursive: true });
  mkdirSync(masters, { recursive: true });
  mkdirSync(bin);
  writeFileSync(contentPath, content);
  const pnpm = path.join(bin, "pnpm");
  writeFileSync(
    pnpm,
    `#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from "node:fs";
const args = process.argv.slice(2);
if (args.includes("put")) {
  if (!existsSync(args[args.indexOf("--file") + 1])) process.exit(2);
  appendFileSync("uploads.jsonl", JSON.stringify(args) + "\\n");
  const count = readFileSync("uploads.jsonl", "utf8").trim().split("\\n").length;
  if (count === Number(process.env.FAIL_UPLOAD)) process.exit(1);
}
`,
  );
  chmodSync(pnpm, 0o755);
  const generate = (name, color = "blue") => {
    const result = spawnSync("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-f",
      "lavfi",
      "-i",
      `color=c=${color}:size=64x36:rate=60`,
      "-t",
      "0.5",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      path.join(masters, `${name}.mp4`),
    ]);
    assert.equal(result.status, 0, result.stderr?.toString());
  };
  generate("cover");
  generate("detail");
  const run = (env = {}) =>
    spawnSync(process.execPath, [script, "example"], {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        PATH: `${bin}${path.delimiter}${process.env.PATH}`,
        ...env,
      },
    });
  const uploads = () =>
    existsSync(path.join(root, "uploads.jsonl"))
      ? readFileSync(path.join(root, "uploads.jsonl"), "utf8")
          .trim()
          .split("\n")
          .map(JSON.parse)
      : [];
  return { root, contentPath, masters, run, generate, uploads };
}

test(
  "syncs multiple videos, skips unchanged masters, and updates only a changed video",
  { skip: !hasFfmpeg },
  (t) => {
    const project = fixture(t);
    let result = project.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(project.uploads().length, 6);
    const first = readFileSync(project.contentPath, "utf8");
    assert.match(first, /Keep this case study text unchanged\./);
    assert.match(first, /poster="\/cover.jpg"/);
    assert.match(first, /alt="Requesting time off"/);
    assert.match(first, /width=\{64\}/);
    const blocks = findVideoBlocks(first, "example");
    assert.equal(blocks.length, 2);
    for (const block of blocks) {
      assert.match(
        block.tag,
        new RegExp(`${block.name}-[a-f0-9]{16}-small\\.mp4`),
      );
      assert.match(block.tag, /videoSources=/);
    }
    for (const args of project.uploads()) {
      assert.ok(args.includes("--remote"));
      assert.ok(args.includes("public, max-age=31536000, immutable"));
    }
    result = project.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(project.uploads().length, 6);
    assert.equal(readFileSync(project.contentPath, "utf8"), first);
    project.generate("detail", "red");
    result = project.run();
    assert.equal(result.status, 0, result.stderr);
    assert.equal(project.uploads().length, 9);
    const changed = findVideoBlocks(
      readFileSync(project.contentPath, "utf8"),
      "example",
    );
    assert.equal(changed[0].tag, blocks[0].tag);
    assert.notEqual(changed[1].tag, blocks[1].tag);
  },
);

test(
  "an upload failure leaves the page untouched and a retry can reuse encodes",
  { skip: !hasFfmpeg },
  (t) => {
    const project = fixture(t);
    let result = project.run({ FAIL_UPLOAD: "3" });
    assert.equal(result.status, 1);
    assert.equal(readFileSync(project.contentPath, "utf8"), content);
    result = project.run();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /reusing completed encodes/);
    assert.equal(project.uploads().length, 9);
    assert.notEqual(readFileSync(project.contentPath, "utf8"), content);
  },
);

test(
  "a master without a matching component fails before uploading or editing",
  { skip: !hasFfmpeg },
  (t) => {
    const project = fixture(t);
    project.generate("unmapped");
    const result = project.run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /No matching video.*unmapped.mp4/);
    assert.equal(project.uploads().length, 0);
    assert.equal(readFileSync(project.contentPath, "utf8"), content);
  },
);
