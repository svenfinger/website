import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import { Note } from "@/components/note";
import { client } from "@/sanity/client";
import type { NOTE_BY_SLUG_QUERY_RESULT } from "../../../../../sanity.types";

const NOTE_BY_SLUG_QUERY = defineQuery(
  `*[_type == "notes" && slug.current == $slug][0]{
    _type,
    title,
    slug,
    publishedAt,
    mainImage,
    body
  }`
);

export default async function NoteRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await client.fetch<NOTE_BY_SLUG_QUERY_RESULT>(
    NOTE_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: 30 } }
  );

  if (!doc) {
    notFound();
  }

  return <Note doc={doc} />;
}
