import Link from 'next/link'
import type {NOTES_LIST_QUERY_RESULT} from '../../../sanity.types'

type NoteRow = NOTES_LIST_QUERY_RESULT[number]

export function NotesBlock({notes}: {notes: NoteRow[] | null}) {
  const list = notes ?? []

  return (
    <section className="not-editor py-12 md:py-24" aria-labelledby="notes-block-heading">
      <h2
        id="notes-block-heading"
        className="border-border-subtle mb-12 border-b pb-6 font-serif text-5xl"
      >
        Notes
      </h2>
      {list.length === 0 ? (
        <p className="text-foreground-secondary">No notes yet.</p>
      ) : (
        <ul className="space-y-8">
          {list.map((note) => (
            <li key={note._id}>
              <Link
                href={`/note/${note.slug?.current}`}
                className="text-foreground-secondary hover:text-interactive-primary-hover flex gap-2"
              >
                <h3 className="grow">{note.title}</h3>
                {note.publishedAt ? (
                  <time dateTime={note.publishedAt}>
                    {new Date(note.publishedAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
