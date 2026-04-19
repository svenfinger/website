"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PhosphorIcon } from "../icons/phosphor-icon";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className={isHome ? undefined : "my-12 md:my-24"}>
      {!isHome && (
        <nav aria-label="Site">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-interactive-primary-default hover:text-interactive-primary-hover"
          >
            <PhosphorIcon name="CaretLeft" weight="bold" className="w-3.5 h-3.5 relative top-px" />
            Home
          </Link>
        </nav>
      )}
    </header>
  );
}
