import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
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

export default async function PageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const doc = await client.fetch<PAGE_BY_SLUG_QUERY_RESULT>(
    PAGE_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  );

  if (!doc) {
    notFound();
  }

  return <Page title={doc.title} body={doc.body} />;
}
