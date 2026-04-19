import Link from "next/link";
import type { Slug } from "../../../sanity.types";

export type FooterMenuItem = {
  _id: string;
  title: string | null;
  slug: Slug | null;
};

export function Footer({ menuItems }: { menuItems: FooterMenuItem[] }) {
  const links = menuItems.filter((item) => item.slug?.current);

  return (
    <footer className="border-t border-border-subtle text-foreground-secondary pt-6 my-12 md:my-24">
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-6">
          <li>© {new Date().getFullYear()}</li>
          {links.map((item) => (
            <li key={item._id}>
              <Link
                href={`/${item.slug!.current}`}
                className="text-foreground-secondary hover:text-interactive-primary-hover"
              >
                {item.title ?? item.slug!.current}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
