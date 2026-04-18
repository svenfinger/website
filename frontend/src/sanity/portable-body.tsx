import { cache } from "react";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { createBodyComponents } from "@/sanity/body-components";
import { NOTES_LIST_QUERY } from "@/sanity/queries";
import type {
  BlockContent,
  NOTES_LIST_QUERY_RESULT,
  PageBody,
} from "../../sanity.types";

type PortableBodyValue = BlockContent | PageBody;

const getNotesForNotesBlock = cache(async () =>
  client.fetch<NOTES_LIST_QUERY_RESULT>(
    NOTES_LIST_QUERY,
    {},
    { next: { revalidate: 30 } }
  )
);

function bodyHasNotesBlock(body: PortableBodyValue | null | undefined): boolean {
  if (!body?.length) return false;
  return body.some((block) => block._type === "notesBlock");
}

/** Renders Portable Text and loads note data only when the document includes a Notes list block. */
export async function PortableBody({
  body,
}: {
  body: PortableBodyValue | null | undefined;
}) {
  if (!body?.length) return null;

  const notes = bodyHasNotesBlock(body)
    ? await getNotesForNotesBlock()
    : null;
  const components = createBodyComponents({ notes });

  return <PortableText value={body} components={components} />;
}
