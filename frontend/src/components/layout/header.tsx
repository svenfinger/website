'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {PhosphorIcon} from '../icons/phosphor-icon'

export function Header() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  if (isHome) return null

  return (
    <header className="my-12 md:my-24">
      <nav aria-label="Site">
        <Link
          href="/"
          className="text-interactive-primary-default hover:text-interactive-primary-hover inline-flex items-center gap-1.5"
        >
          <PhosphorIcon
            name="CaretLeft"
            weight="bold"
            className="relative top-px h-3.5 w-3.5"
            aria-hidden
          />
          Home
        </Link>
      </nav>
    </header>
  )
}
