import { negotiate } from "./accept.ts";

const pageTypes = ["text/html", "text/markdown"];
const errorTypes = [
  ...pageTypes,
  "application/problem+json",
  "application/json",
  "text/plain",
];

function varied(response: Response, head = false): Response {
  const result = new Response(head ? null : response.body, response);
  const vary = result.headers.get("Vary");
  if (
    !vary
      ?.split(",")
      .some((value) => ["accept", "*"].includes(value.trim().toLowerCase()))
  ) {
    result.headers.set("Vary", vary ? `${vary}, Accept` : "Accept");
  }
  // The underlying ASSETS binding caches individual files. Do not cache a
  // negotiated outer response under a URL shared by HTML and Markdown.
  result.headers.set("Cache-Control", "no-store");
  return result;
}

function problem(
  request: Request,
  status: number,
  title: string,
  code: string,
  hint: string,
): Response {
  const type = negotiate(request.headers.get("Accept"), errorTypes);
  const data = {
    type: "about:blank",
    title,
    status,
    detail: hint,
    instance: new URL(request.url).pathname,
    code,
    hint,
  };
  const json =
    type === "application/json" || type === "application/problem+json";
  const body = json
    ? JSON.stringify(data)
    : type
      ? `${title}\n\n${hint}\n`
      : null;
  const response = new Response(body, {
    status,
    headers: {
      "Content-Type": json
        ? `${type}; charset=utf-8`
        : "text/plain; charset=utf-8",
      ...(status === 405 ? { Allow: "GET, HEAD" } : {}),
    },
  });
  return varied(response, request.method === "HEAD");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      if (!["GET", "HEAD"].includes(request.method)) {
        return problem(
          request,
          405,
          "Method Not Allowed",
          "method_not_allowed",
          "Use GET or HEAD. This site has no write API.",
        );
      }
      // Inspect the asset without conditional/range headers first, so 304/206
      // responses cannot hide its media type before negotiation.
      const probe = new Request(request, { method: "HEAD" });
      for (const name of [
        "If-None-Match",
        "If-Modified-Since",
        "Range",
        "If-Range",
      ])
        probe.headers.delete(name);
      const asset = await env.ASSETS.fetch(probe);
      if (asset.status >= 300 && asset.status < 400) return varied(asset);
      if (asset.status === 404) {
        const type = negotiate(request.headers.get("Accept"), errorTypes);
        if (type === "text/html")
          return varied(
            await env.ASSETS.fetch(request),
            request.method === "HEAD",
          );
        if (type === "text/markdown") {
          const markdown = await env.ASSETS.fetch(
            new URL("/404.md", request.url),
          );
          return varied(
            new Response(markdown.body, {
              status: 404,
              headers: { "Content-Type": "text/markdown; charset=utf-8" },
            }),
            request.method === "HEAD",
          );
        }
        return problem(
          request,
          404,
          "Not Found",
          "not_found",
          "Check the URL or visit /openapi.json for the available pages.",
        );
      }
      if (!asset.headers.get("Content-Type")?.includes("text/html"))
        return env.ASSETS.fetch(request);
      const type = negotiate(request.headers.get("Accept"), pageTypes);
      if (!type)
        return problem(
          request,
          406,
          "Not Acceptable",
          "not_acceptable",
          "Request text/html or text/markdown in the Accept header.",
        );
      if (type === "text/html")
        return varied(
          await env.ASSETS.fetch(request),
          request.method === "HEAD",
        );
      const url = new URL(request.url);
      url.pathname = url.pathname.endsWith("/")
        ? `${url.pathname}index.md`
        : url.pathname.replace(/\.html$/, "") + ".md";
      const markdown = await env.ASSETS.fetch(new Request(url, request));
      if (!markdown.ok && markdown.status !== 304)
        throw new Error("Missing Markdown asset");
      const response = new Response(markdown.body, markdown);
      response.headers.set("Content-Type", "text/markdown; charset=utf-8");
      if (
        ["/privacy/", "/imprint/", "/404"].includes(
          new URL(request.url).pathname,
        )
      )
        response.headers.set("X-Robots-Tag", "noindex");
      return varied(response, request.method === "HEAD");
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "Asset delivery failed",
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      );
      return problem(
        request,
        500,
        "Internal Server Error",
        "internal_error",
        "Retry later. If the problem persists, contact hi@svenfinger.com.",
      );
    }
  },
} satisfies ExportedHandler<Env>;
