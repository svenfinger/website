import Image from "next/image";
import type { PortableTextComponents } from "next-sanity";
import { IntroBlock } from "@/components/portable/intro-block";
import { NotesBlock } from "@/components/portable/notes-block";
import { urlFor } from "@/sanity/image";
import type { NOTES_FOR_PORTABLE_BLOCK_QUERY_RESULT } from "../../sanity.types";

function imageBlock({ value }: { value: { asset?: { _ref?: string }; alt?: string } }) {
  if (!value?.asset?._ref) return null;
  return (
    <Image
      src={urlFor(value).width(800).auto("format").url()}
      alt={value.alt || ""}
      width={800}
      height={450}
      className="rounded-lg my-8"
    />
  );
}

export function createBodyComponents(options?: {
  notes?: NOTES_FOR_PORTABLE_BLOCK_QUERY_RESULT | null;
}): PortableTextComponents {
  const notes = options?.notes ?? null;

  const components: PortableTextComponents = {
    types: {
      image: imageBlock,
      introBlock: ({ value }) => (
        <IntroBlock value={value} components={components} />
      ),
      notesBlock: () => <NotesBlock notes={notes} />,
    },
  };

  return components;
}

export const bodyComponents = createBodyComponents();
