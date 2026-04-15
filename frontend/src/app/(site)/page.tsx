import Link from "next/link";
import { defineQuery } from "next-sanity";
import { Page } from "@/components/page";
import { client } from "@/sanity/client";
import type { HOME_QUERY_RESULT, NOTES_QUERY_RESULT } from "../../../sanity.types";

const HOME_QUERY = defineQuery(`*[_id == "configuration"][0]{
  homePage->{
    title,
    slug,
    body
  }
}`);

const NOTES_QUERY = defineQuery(
  `*[_type == "notes" && defined(slug.current)] | order(publishedAt desc)[0...12]{
    _id,
    title,
    slug,
    publishedAt
  }`
);

export default async function Home() {
  const home = await client.fetch<HOME_QUERY_RESULT>(
    HOME_QUERY,
    {},
    { next: { revalidate: 30 } }
  );

  const configured = home?.homePage;
  if (configured?.title) {
    return (
      <Page
        isHome
        title={configured.title}
        body={configured.body}
        slug={configured.slug}
      />
    );
  }

  const notes = await client.fetch<NOTES_QUERY_RESULT>(
    NOTES_QUERY,
    {},
    { next: { revalidate: 30 } }
  );

  return (
    <Page
      isHome
      title="Notes"
      lead={
        <p className="text-gray-600 mb-8">
          No home page is set yet. Choose one under{" "}
          <strong>Configuration</strong> in Sanity Studio, or browse notes
          below.
        </p>
      }
    >
      <ul className="mt-12 space-y-8">
        {notes.map((note) => (
          <li key={note._id}>
            <Link
              href={`/note/${note.slug?.current}`}
              className="group block"
            >
              <h2 className="text-2xl font-semibold group-hover:underline">
                {note.title}
              </h2>
              {note.publishedAt && (
                <time className="text-gray-500">
                  {new Date(note.publishedAt).toLocaleDateString()}
                </time>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
