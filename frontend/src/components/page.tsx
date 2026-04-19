import { PortableBody } from "@/sanity/portable-body";
import type { PageBody, Slug } from "../../sanity.types";

export type PageProps = {
  title: string | null;
  body?: PageBody | null;
  /** When set (e.g. configured home), links to the canonical `/{slug}` URL. */
  slug?: Slug | null;
  /** When true (site root), the visible page title is omitted. */
  isHome?: boolean;
  /** Intro copy above the title (e.g. empty Configuration state). */
  lead?: React.ReactNode;
  /** Extra blocks below the main body (e.g. note index). */
  children?: React.ReactNode;
};

/** Renders Sanity `page` content: top-level routes like `/privacy`, `/`, etc. */
export function Page({ title, body, lead, children, isHome = false }: PageProps) {
  const showTitle = !isHome && title;

  return (
    <>
      {lead}
      {showTitle ? (
        <h1 className="text-5xl mb-12 font-serif pb-6 border-b border-border-subtle">{title}</h1>
      ) : null}
      {body ? (
        <div className={`editor${isHome ? " stagger-enter [animation:none]" : ""}`}>
          <PortableBody body={body} />
        </div>
      ) : null}
      {children}
    </>
  );
}
