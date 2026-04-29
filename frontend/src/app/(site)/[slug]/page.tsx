import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import { cache } from "react";
import { Page } from "@/components/page";
import { client } from "@/sanity/client";
import type { PAGE_BY_SLUG_QUERY_RESULT } from "../../../../sanity.types";

const PAGE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    title,
    slug,
    body
  }`
);

const getPage = cache((slug: string) =>
  client.fetch<PAGE_BY_SLUG_QUERY_RESULT>(
    PAGE_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  )
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getPage(slug);
  return doc?.title ? { title: doc.title } : {};
}

export default async function PageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getPage(slug);

  if (!doc) {
    notFound();
  }

  return <Page title={doc.title} body={doc.body} />;
}
