import Link from 'next/link'
import {defineQuery} from 'next-sanity'
import {Page} from '@/components/page'
import {client} from '@/sanity/client'
import {NOTES_LIST_RECENT_QUERY} from '@/sanity/queries'
import type {HOME_QUERY_RESULT, NOTES_LIST_RECENT_QUERY_RESULT} from '../../../sanity.types'

const HOME_QUERY = defineQuery(`*[_id == "configuration"][0]{
  homePage->{
    title,
    slug,
    body
  }
}`)

export default async function Home() {
  const home = await client.fetch<HOME_QUERY_RESULT>(HOME_QUERY, {}, {next: {revalidate: 30}})

  const configured = home?.homePage
  if (configured?.title) {
    return <Page isHome title={configured.title} body={configured.body} slug={configured.slug} />
  }

  const notes = await client.fetch<NOTES_LIST_RECENT_QUERY_RESULT>(
    NOTES_LIST_RECENT_QUERY,
    {},
    {next: {revalidate: 30}},
  )

  return (
    <Page
      isHome
      title="Notes"
      lead={
        <p className="text-foreground-secondary mb-8">
          No home page is set yet. Choose one under <strong>Configuration</strong> in Sanity Studio,
          or browse notes below.
        </p>
      }
    >
      <ul className="mt-12 space-y-8">
        {notes.map((note) => (
          <li key={note._id}>
            <Link href={`/note/${note.slug?.current}`} className="group block">
              <h2 className="text-2xl font-semibold group-hover:underline">{note.title}</h2>
              {note.publishedAt && (
                <time className="text-foreground-secondary">
                  {new Date(note.publishedAt).toLocaleDateString()}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  )
}
