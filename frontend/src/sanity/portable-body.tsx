import { cache } from "react";
import { defineQuery, PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { createBodyComponents } from "@/sanity/bodyComponents";
import type {
  BlockContent,
  NOTES_FOR_PORTABLE_BLOCK_QUERY_RESULT,
} from "../../sanity.types";

const NOTES_FOR_PORTABLE_BLOCK_QUERY = defineQuery(
  `*[_type == "notes" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt
  }`
);

const getNotesForNotesBlock = cache(async () =>
  client.fetch<NOTES_FOR_PORTABLE_BLOCK_QUERY_RESULT>(
    NOTES_FOR_PORTABLE_BLOCK_QUERY,
    {},
    { next: { revalidate: 30 } }
  )
);

function blockContentHasNotesBlock(body: BlockContent | null | undefined): boolean {
  if (!body?.length) return false;
  return body.some((block) => block._type === "notesBlock");
}

/** Renders Portable Text and loads note data only when the document includes a Notes list block. */
export async function PortableBody({
  body,
}: {
  body: BlockContent | null | undefined;
}) {
  if (!body?.length) return null;

  const notes = blockContentHasNotesBlock(body)
    ? await getNotesForNotesBlock()
    : null;
  const components = createBodyComponents({ notes });

  return <PortableText value={body} components={components} />;
}
