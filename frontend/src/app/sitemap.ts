import type { MetadataRoute } from "next";
import { client } from "@/sanity/client";
import { SITEMAP_QUERY } from "@/sanity/queries";

type SitemapQueryResult = {
  home: {
    slug: string | null;
    updatedAt: string | null;
  } | null;
  pages: Array<{
    slug: string | null;
    _updatedAt: string;
  }>;
  notes: Array<{
    slug: string | null;
    _updatedAt: string;
  }>;
};

function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be set to generate the sitemap.");
  }
  return raw.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const data = await client.fetch<SitemapQueryResult>(
    SITEMAP_QUERY,
    {},
    { next: { revalidate: 3600 } },
  );

  const homeSlug = data?.home?.slug ?? null;
  const homeUpdatedAt = data?.home?.updatedAt ?? null;

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: homeUpdatedAt ? new Date(homeUpdatedAt) : new Date(),
    },
  ];

  for (const page of data?.pages ?? []) {
    if (!page.slug || page.slug === homeSlug) continue;
    entries.push({
      url: `${siteUrl}/${page.slug}`,
      lastModified: new Date(page._updatedAt),
    });
  }

  for (const note of data?.notes ?? []) {
    if (!note.slug) continue;
    entries.push({
      url: `${siteUrl}/note/${note.slug}`,
      lastModified: new Date(note._updatedAt),
    });
  }

  return entries;
}
