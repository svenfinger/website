import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { readFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { negotiate } from "../worker/accept.ts";
import worker from "../worker/index.ts";
import { htmlToMarkdown } from "./build-markdown.mjs";

let server;
let base;
let logs = "";
before(async () => {
  const portServer = createServer();
  portServer.listen(0, "127.0.0.1");
  await once(portServer, "listening");
  const port = portServer.address().port;
  await new Promise((resolve) => portServer.close(resolve));
  base = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    [
      "node_modules/wrangler/bin/wrangler.js",
      "dev",
      "--local",
      "--ip",
      "127.0.0.1",
      "--port",
      String(port),
      "--inspector-port",
      "0",
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", (data) => {
    logs += data;
  });
  server.stderr.on("data", (data) => {
    logs += data;
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      await fetch(base);
      return;
    } catch {
      await delay(100);
    }
    if (server.exitCode !== null) break;
  }
  throw new Error(`Worker did not start: ${logs}`);
});
after(async () => {
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await once(server, "exit");
  }
});

function get(path = "/", accept = "text/html", options = {}) {
  return fetch(base + path, {
    ...options,
    headers: { Accept: accept, ...options.headers },
  });
}
function type(response, expected) {
  assert.equal(response.headers.get("content-type")?.split(";")[0], expected);
}
function varies(response) {
  assert.match(response.headers.get("vary"), /(?:^|,\s*)Accept(?:,|$)/i);
  assert.equal(response.headers.get("cache-control"), "no-store");
}

test("Accept respects quality, specificity, exclusions, parameters, and browser defaults", () => {
  const cases = [
    [null, "text/html"],
    ["", undefined],
    ["*/*", "text/html"],
    ["text/*", "text/html"],
    ["text/markdown", "text/markdown"],
    ['TEXT/MARKDOWN; charset="UTF-8"', "text/markdown"],
    ["text/markdown;q=0.3,text/html;q=0.8", "text/html"],
    ["text/html;q=0.3,text/markdown;q=0.8", "text/markdown"],
    ["text/markdown;q=0,*/*;q=1", "text/html"],
    ["text/html;q=0,*/*;q=1", "text/markdown"],
    ["text/html;q=0,text/markdown;q=0", undefined],
    ["text/markdown;q=0", undefined],
    ["application/json", undefined],
    ["text/html;q=0.2,text/*;q=0.8", "text/markdown"],
    ["text/markdown,*/*", "text/markdown"],
    ['text/markdown;profile="a,b",text/html', "text/html"],
    ["text/markdown;q=bogus,text/html;q=0.5", "text/html"],
    ["text/markdown;q=1.1,text/html", "text/html"],
    [
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "text/html",
    ],
  ];
  for (const [accept, expected] of cases)
    assert.equal(
      negotiate(accept, ["text/html", "text/markdown"]),
      expected,
      String(accept),
    );
});

test("Markdown conversion uses main content, decodes entities, and preserves links and media", async () => {
  const markdown = await htmlToMarkdown(
    '<!doctype html><html><body><nav>Outside</nav><main><h1>A &amp; B</h1><p>Use *literal* <a href="/privacy/">privacy</a>.</p><img src="/og.png" alt="Preview"><video data-src="https://media.svenfinger.com/demo.mp4" aria-label="Demo"></video><script>hidden()</script></main></body></html>',
  );
  assert.match(markdown, /^# A & B/);
  assert.match(markdown, /\\\*literal\\\*/);
  assert.ok(markdown.includes("[privacy](<https://svenfinger.com/privacy/>)"));
  assert.ok(markdown.includes("![Preview](<https://svenfinger.com/og.png>)"));
  assert.ok(
    markdown.includes("[Video: Demo](<https://media.svenfinger.com/demo.mp4>)"),
  );
  assert.doesNotMatch(markdown, /Outside|hidden|<script/);
  await assert.rejects(htmlToMarkdown("<p>No main</p>"), /no main/);
});

test("homepage contains substantial raw HTML, sequential headings, metadata, and Person JSON-LD", async () => {
  const response = await get();
  assert.equal(response.status, 200);
  type(response, "text/html");
  varies(response);
  const html = await response.text();
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
  const paragraphs = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => m[1].replace(/<[^>]+>/g, ""))
    .join(" ");
  assert.ok(paragraphs.length >= 500);
  assert.match(
    main,
    /<h1[^>]*>[\s\S]*Sven Finger — Design engineer in Hamburg[\s\S]*?<\/h1>/,
  );
  assert.deepEqual(
    [...main.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1])),
    [1, 2, 2, 2, 2, 2],
  );
  assert.match(
    html,
    /<title>Sven Finger — Design engineer in Hamburg<\/title>/,
  );
  assert.match(html, /<html[^>]*lang="en"/);
  assert.match(html, /rel="canonical" href="https:\/\/svenfinger.com\/"/);
  assert.match(html, /property="og:type" content="website"/);
  assert.match(
    html,
    /property="og:image" content="https:\/\/svenfinger.com\/og.png"/,
  );
  const person = JSON.parse(
    html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  assert.equal(person["@type"], "Person");
  assert.equal(person.url, "https://svenfinger.com/");
  assert.equal(person.sameAs.length, 3);
  assert.ok(person.knowsAbout.length > 0);
});

test("every page negotiates HTML and Markdown, including HEAD, redirects, and query strings", async () => {
  for (const [path, heading, asset] of [
    ["/", "Sven Finger", "index.md"],
    ["/privacy/", "Privacy", "privacy/index.md"],
    ["/imprint/", "Imprint", "imprint/index.md"],
  ]) {
    for (const accept of ["text/html", "text/markdown"]) {
      const response = await get(path + "?source=agent", accept);
      assert.equal(response.status, 200);
      type(response, accept);
      varies(response);
      const body = await response.text();
      assert.ok(body.includes(heading));
      if (accept === "text/markdown") {
        assert.equal(body, await readFile(`dist/${asset}`, "utf8"));
        assert.doesNotMatch(body, /<script|<style|import WorkMedia|<WorkMedia/);
      }
      const head = await get(path, accept, { method: "HEAD" });
      assert.equal(head.status, 200);
      type(head, accept);
      varies(head);
      assert.equal(await head.text(), "");
    }
    const direct = await get("/" + asset, "text/markdown");
    assert.equal(direct.status, 200);
    type(direct, "text/markdown");
    if (path !== "/") {
      const redirect = await get(path.slice(0, -1), "text/markdown");
      assert.equal(redirect.status, 200);
      type(redirect, "text/markdown");
      assert.equal(redirect.headers.get("x-robots-tag"), "noindex");
      assert.equal(direct.headers.get("x-robots-tag"), "noindex");
      assert.match(
        await (await get(path)).text(),
        /name="robots" content="noindex"/,
      );
    }
  }
});

test("quality values, unavailable formats, and cache validators work through the runtime", async () => {
  for (const [accept, expected, status] of [
    ["text/markdown,text/html;q=0.5", "text/markdown", 200],
    ["text/markdown;q=0,*/*", "text/html", 200],
    ["application/json", "application/json", 406],
    ["image/png", "text/plain", 406],
  ]) {
    const response = await get("/", accept);
    assert.equal(response.status, status);
    type(response, expected);
    varies(response);
  }
  const html = await get();
  const markdown = await get("/", "text/markdown");
  const htmlTag = html.headers.get("etag");
  const markdownTag = markdown.headers.get("etag");
  assert.ok(htmlTag);
  assert.ok(markdownTag);
  assert.notEqual(htmlTag, markdownTag);
  const own = await get("/", "text/markdown", {
    headers: { "If-None-Match": markdownTag },
  });
  assert.equal(own.status, 304);
  varies(own);
  const other = await get("/", "text/markdown", {
    headers: { "If-None-Match": htmlTag },
  });
  assert.equal(other.status, 200);
  type(other, "text/markdown");
  type(await get(), "text/html");
});

test("404, 405, and 406 errors offer JSON problem details and preserve the HTML 404", async () => {
  for (const accept of ["application/json", "application/problem+json"]) {
    for (const [path, method, status, code] of [
      ["/api/nonexistent", "GET", 404, "not_found"],
      ["/", "POST", 405, "method_not_allowed"],
      ["/", "GET", 406, "not_acceptable"],
    ]) {
      const response = await get(path, accept, { method });
      assert.equal(response.status, status);
      type(response, accept);
      varies(response);
      const data = await response.json();
      assert.equal(data.type, "about:blank");
      assert.equal(data.status, status);
      assert.equal(data.code, code);
      assert.equal(data.instance, path);
      assert.ok(data.title && data.detail && data.hint);
      if (status === 405)
        assert.equal(response.headers.get("allow"), "GET, HEAD");
    }
  }
  const html = await get("/missing");
  assert.equal(html.status, 404);
  type(html, "text/html");
  assert.match(await html.text(), /Page not found/);
  const markdown = await get("/missing", "text/markdown");
  assert.equal(markdown.status, 404);
  type(markdown, "text/markdown");
  assert.match(await markdown.text(), /^# Page not found/);
  const head = await get("/missing", "application/json", { method: "HEAD" });
  assert.equal(head.status, 404);
  assert.equal(await head.text(), "");
});

test("unexpected asset failures return a sanitized structured 500", async () => {
  const response = await worker.fetch(
    new Request("https://svenfinger.com/", {
      headers: { Accept: "application/json" },
    }),
    {
      ASSETS: {
        fetch() {
          throw new Error("internal test failure");
        },
      },
    },
  );
  assert.equal(response.status, 500);
  const body = await response.json();
  assert.equal(body.code, "internal_error");
  assert.doesNotMatch(JSON.stringify(body), /internal test failure/);
});

test("machine-readable files, described endpoints, images, and immutable assets are reachable", async () => {
  const robots = await get("/robots.txt", "text/plain");
  assert.equal(robots.status, 200);
  type(robots, "text/plain");
  assert.equal(
    await robots.text(),
    await readFile("public/robots.txt", "utf8"),
  );
  const sitemap = await get("/sitemap.xml", "application/xml");
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
  for (const [, url] of xml.matchAll(/<loc>(.*?)<\/loc>/g))
    assert.equal((await get(new URL(url).pathname)).status, 200);
  const specResponse = await get("/openapi.json", "application/json");
  assert.equal(specResponse.status, 200);
  type(specResponse, "application/json");
  const spec = await specResponse.json();
  assert.equal(spec.openapi, "3.1.1");
  assert.ok(spec.info.title && spec.info.version);
  assert.equal(spec.servers[0].url, "https://svenfinger.com");
  for (const [path, operations] of Object.entries(spec.paths)) {
    for (const media of Object.keys(operations.get.responses[200].content)) {
      const response = await get(path, media);
      assert.equal(response.status, 200, `${path} ${media}`);
      type(response, media);
    }
  }
  function references(value) {
    if (!value || typeof value !== "object") return;
    if (value.$ref)
      assert.ok(
        value.$ref
          .slice(2)
          .split("/")
          .reduce((node, key) => node?.[key], spec),
        value.$ref,
      );
    Object.values(value).forEach(references);
  }
  references(spec);
  assert.equal((await get("/og.png", "image/png")).status, 200);
  const html = await (await get()).text();
  const css = html.match(/href="(\/_astro\/[^\"]+\.css)"/)[1];
  const asset = await get(css, "text/css");
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get("cache-control"), /immutable/);
  const missingSpec = await get("/api/openapi.yaml", "application/json");
  assert.equal(missingSpec.status, 404);
  type(missingSpec, "application/json");
});

test("agent User-Agents receive the same homepage content", async () => {
  const reference = await (await get()).text();
  for (const agent of [
    "ChatGPT-User",
    "OAI-SearchBot",
    "Claude-User",
    "PerplexityBot",
  ]) {
    const response = await get("/", "text/html", {
      headers: { "User-Agent": agent },
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), reference);
  }
});
