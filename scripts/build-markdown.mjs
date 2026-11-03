import { glob, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";

const site = "https://svenfinger.com";
const escape = (text) => text.replace(/([\\`*_[\]<>])/g, "\\$1");
const absolute = (href) => new URL(href, site).href;

// Serialize the elements used by this portfolio, after the existing Markdown
// processor parses the built HTML. No MDX imports or component source leak out.
function serialize(node) {
  if (node.type === "text") return escape(node.value.replace(/\s+/g, " "));
  if (node.type !== "element" && node.type !== "root") return "";
  const tag = node.tagName;
  const props = node.properties ?? {};
  if (["script", "style", "svg", "noscript"].includes(tag)) return "";
  const content = (node.children ?? []).map(serialize).join("");
  if (/^h[1-6]$/.test(tag))
    return `\n\n${"#".repeat(Number(tag[1]))} ${content.trim()}\n\n`;
  if (tag === "a") {
    const label = content.trim() || escape(props.ariaLabel ?? "");
    return label && props.href
      ? `[${label}](<${absolute(props.href)}>)`
      : label;
  }
  if (tag === "img")
    return props.alt
      ? `\n\n![${escape(props.alt)}](<${absolute(props.src)}>)\n\n`
      : "";
  if (tag === "video")
    return `\n\n[Video: ${escape(props.ariaLabel ?? "Project demonstration")}](<${absolute(props.dataSrc)}>)\n\n`;
  if (tag === "nav")
    return `\n\n${(node.children ?? [])
      .map(serialize)
      .filter((text) => text.trim())
      .join(" ")}\n\n`;
  if (tag === "br") return "\n";
  if (tag === "strong" || tag === "b") return `**${content}**`;
  if (tag === "em" || tag === "i") return `*${content}*`;
  if (
    ["p", "div", "section", "article", "nav", "address", "header"].includes(tag)
  )
    return `\n\n${content.trim()}\n\n`;
  return content;
}

export async function htmlToMarkdown(html) {
  let markdown;
  const processor = await createSatteriMarkdownProcessor({
    syntaxHighlight: false,
    smartypants: false,
    features: { rawHtml: true },
    hastPlugins: [
      {
        name: "portfolio-markdown",
        element: {
          filter: ["main"],
          visit(node) {
            markdown =
              serialize(node)
                .replace(/\n[ \t]+/g, "\n")
                .replace(/\n{3,}/g, "\n\n")
                .trim() + "\n";
          },
        },
      },
    ],
  });
  await processor.render(html);
  if (!markdown?.trim())
    throw new Error("Page has no main content to publish as Markdown");
  return markdown;
}

export async function buildMarkdown() {
  for await (const file of glob("dist/**/*.html")) {
    await writeFile(
      file.replace(/\.html$/, ".md"),
      await htmlToMarkdown(await readFile(file, "utf8")),
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await buildMarkdown();
