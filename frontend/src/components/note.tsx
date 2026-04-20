import Image from "next/image";
import { PortableBody } from "@/sanity/portable-body";
import { urlFor } from "@/sanity/image";
import type { NOTE_BY_SLUG_QUERY_RESULT } from "../../sanity.types";

type NoteDoc = NonNullable<NOTE_BY_SLUG_QUERY_RESULT>;

/** Renders a Sanity `notes` document at `/note/[slug]`. */
export function Note({ doc }: { doc: NoteDoc }) {
  return (
    <>
      <h1 className="text-5xl font-serif mb-8">{doc.title}</h1>
      {doc.mainImage && (
        <Image
          src={urlFor(doc.mainImage).width(1248).url()}
          alt={doc.title || ""}
          width={624}
          height={351}
          className="rounded-lg mb-12 w-full"
          loading="eager"
        />
      )}
      <div className="editor mb-12">
        {doc.body ? <PortableBody body={doc.body} /> : null}
      </div>
      {doc.publishedAt && (
        <div className="mb-24">
          <time className="text-foreground-secondary" dateTime={doc.publishedAt}>
            {new Date(doc.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
          </time>
        </div>
      )}
    </>
  );
}
