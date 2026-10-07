import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const usage = `Usage: pnpm video:encode <master.mp4> <output-directory> [options]

  --name <name>              Output prefix (defaults to the input filename)
  --widths <small,medium,large>  Maximum widths (default: 1280,1920,2560)
  --help                    Show this help

Creates <name>-small.mp4 and <name>-medium.mp4 at up to 30 fps,
and <name>-large.mp4 at up to 60 fps. Existing files are never overwritten.`;

function run(command, args, capture = false) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.error?.code === "ENOENT") {
    throw new Error(`${command} is required. Install FFmpeg before encoding.`);
  }
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `${command} failed.`);
  }
  return result.stdout;
}

function probe(input) {
  const metadata = JSON.parse(
    run(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height,avg_frame_rate",
        "-of",
        "json",
        input,
      ],
      true,
    ),
  );
  const stream = metadata.streams?.[0];
  const [numerator, denominator] = (stream?.avg_frame_rate ?? "0/1")
    .split("/")
    .map(Number);
  const fps = numerator / denominator;
  if (!stream?.width || !stream.height || !Number.isFinite(fps) || fps <= 0) {
    throw new Error(`Cannot read video dimensions or frame rate: ${input}`);
  }
  return { ...stream, fps };
}

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      name: { type: "string" },
      widths: { type: "string", default: "1280,1920,2560" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(usage);
    process.exit(0);
  }
  if (positionals.length !== 2) throw new Error(usage);

  const [inputPath, outputPath] = positionals;
  const input = path.resolve(inputPath);
  const directory = path.resolve(outputPath);
  const name = values.name ?? path.parse(input).name;
  if (!name || /[/\\]/.test(name)) {
    throw new Error("The output name must be a filename without directories.");
  }
  const widths = values.widths.split(",").map(Number);
  if (
    widths.length !== 3 ||
    widths.some(
      (width) => !Number.isInteger(width) || width < 2 || width % 2,
    ) ||
    widths[0] > widths[1] ||
    widths[1] > widths[2]
  ) {
    throw new Error("Provide three ascending, positive even widths.");
  }
  const variants = ["small", "medium", "large"].map((size, index) => ({
    output: path.join(directory, `${name}-${size}.mp4`),
    width: widths[index],
    fps: index === 2 ? 60 : 30,
  }));
  for (const variant of variants) {
    if (existsSync(variant.output)) {
      throw new Error(
        `File already exists: ${variant.output}. Use a new name.`,
      );
    }
  }
  const source = probe(input);
  mkdirSync(directory, { recursive: true });

  for (const variant of variants) {
    console.log(`Encoding ${path.basename(variant.output)}…`);
    const filters = [
      ...(source.fps > variant.fps ? [`fps=${variant.fps}`] : []),
      `scale=w='trunc(min(iw,${variant.width})/2)*2':h=-2:flags=lanczos`,
    ];
    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-n",
      "-i",
      input,
      "-map",
      "0:v:0",
      "-vf",
      filters.join(","),
      "-c:v",
      "libx264",
      "-crf",
      "20",
      "-preset",
      "slow",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-an",
      "-sn",
      "-dn",
      variant.output,
    ]);
    const encoded = probe(variant.output);
    const megabytes = (statSync(variant.output).size / 1_000_000).toFixed(2);
    console.log(
      `${encoded.width} × ${encoded.height}, ${encoded.fps.toFixed(2)} fps, ${megabytes} MB`,
    );
  }
  console.log(`Videos ready to upload: ${directory}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
