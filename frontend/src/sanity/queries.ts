import { defineQuery } from "next-sanity";

const NOTES_LIST_PROJECTION = /* groq */ `{
  _id,
  title,
  slug,
  publishedAt
}`;

/** All published notes, newest first. Used by the Notes list block. */
export const NOTES_LIST_QUERY = defineQuery(
  /* groq */ `*[_type == "notes" && defined(slug.current)] | order(publishedAt desc) ${NOTES_LIST_PROJECTION}`
);

/** The 12 most recent published notes. Used by the home fallback. */
export const NOTES_LIST_RECENT_QUERY = defineQuery(
  /* groq */ `*[_type == "notes" && defined(slug.current)] | order(publishedAt desc)[0...12] ${NOTES_LIST_PROJECTION}`
);

const EXPERIENCE_LIST_PROJECTION = /* groq */ `{
  _id,
  icon,
  company,
  role,
  description,
  timeframe
}`;

/** All experience entries in the order set in the Studio. Used by the Experience list block. */
export const EXPERIENCE_LIST_QUERY = defineQuery(
  /* groq */ `*[_type == "experience"] | order(orderRank) ${EXPERIENCE_LIST_PROJECTION}`
);

/** All slugs and timestamps needed to build the sitemap. */
export const SITEMAP_QUERY = defineQuery(
  /* groq */ `{
    "home": *[_id == "configuration"][0]{
      "slug": homePage->slug.current,
      "updatedAt": homePage->_updatedAt
    },
    "pages": *[_type == "page" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    },
    "notes": *[_type == "notes" && defined(slug.current)]{
      "slug": slug.current,
      _updatedAt
    }
  }`
);
