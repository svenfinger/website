import type { MetadataRoute } from "next";

function getSiteUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return undefined;
  return raw.replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  const robots: MetadataRoute.Robots = {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  };

  if (siteUrl) {
    robots.sitemap = `${siteUrl}/sitemap.xml`;
    robots.host = siteUrl;
  }

  return robots;
}
