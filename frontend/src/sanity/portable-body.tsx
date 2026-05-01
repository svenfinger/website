import { cache } from "react";
import { PortableText } from "next-sanity";
import { client } from "@/sanity/client";
import { createBodyComponents } from "@/sanity/body-components";
import { EXPERIENCE_LIST_QUERY, NOTES_LIST_QUERY } from "@/sanity/queries";
import type {
  BlockContent,
  EXPERIENCE_LIST_QUERY_RESULT,
  NOTES_LIST_QUERY_RESULT,
  PageBody,
} from "../../sanity.types";

type PortableBodyValue = BlockContent | PageBody;

const getNotesForNotesBlock = cache(async () =>
  client.fetch<NOTES_LIST_QUERY_RESULT>(NOTES_LIST_QUERY, {}, { next: { revalidate: 30 } }),
);

const getExperiencesForExperienceBlock = cache(async () =>
  client.fetch<EXPERIENCE_LIST_QUERY_RESULT>(
    EXPERIENCE_LIST_QUERY,
    {},
    { next: { revalidate: 30 } },
  ),
);

function bodyHasBlock(body: PortableBodyValue | null | undefined, type: string): boolean {
  if (!body?.length) return false;
  return body.some((block) => block._type === type);
}

/** Renders Portable Text and lazily loads supporting data only when the relevant blocks are present. */
export async function PortableBody({ body }: { body: PortableBodyValue | null | undefined }) {
  if (!body?.length) return null;

  const [notes, experiences] = await Promise.all([
    bodyHasBlock(body, "notesBlock") ? getNotesForNotesBlock() : null,
    bodyHasBlock(body, "experienceBlock") ? getExperiencesForExperienceBlock() : null,
  ]);
  const components = createBodyComponents({ notes, experiences });

  return <PortableText value={body} components={components} />;
}
