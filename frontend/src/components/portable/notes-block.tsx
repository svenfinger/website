import Link from "next/link";
import type { NOTES_FOR_PORTABLE_BLOCK_QUERY_RESULT } from "../../../sanity.types";

/** Fixed heading for the Notes list block (no CMS field on the block). */
export const NOTES_BLOCK_TITLE = "Notes";

type NoteRow = NOTES_FOR_PORTABLE_BLOCK_QUERY_RESULT[number];

export function NotesBlock({ notes }: { notes: NoteRow[] | null }) {
  const list = notes ?? [];

  return (
    <section className="py-24 not-editor" aria-labelledby="notes-block-heading">
      <h2
        id="notes-block-heading"
        className="text-5xl font-serif font-regular pb-6 border-b border-border-subtle mb-12"
      >
        {NOTES_BLOCK_TITLE}
      </h2>
      {list.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No notes yet.</p>
      ) : (
        <ul className="space-y-8">
          {list.map((note) => (
            <li key={note._id}>
              <Link
                href={`/note/${note.slug?.current}`}
                className="text-foreground-secondary hover:text-interactive-primary-hover flex gap-2"
              >
                <h3 className="grow">
                  {note.title}
                </h3>
                {note.publishedAt ? (
                  <time dateTime={note.publishedAt}>
                    {new Date(note.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                  </time>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
