import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { MenuIcon, XIcon } from "lucide-react";

import { Button } from "@/components/button";
import { GET_IN_TOUCH_HREF, NAV_ITEMS, SITE_NAME } from "@/src/lib/site";

function isActive(href: string, path: string) {
  if (href === "/") {
    return path === "/" || path.startsWith("/work/");
  }

  return href === path;
}

function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM6.00701 19.5C7.64945 20.8141 9.73294 21.6 12 21.6C14.2671 21.6 16.3506 20.8141 17.993 19.5H6.00701ZM4.5 6.00698C3.18586 7.64943 2.4 9.73293 2.4 12C2.4 14.2671 3.18587 16.3506 4.5 17.993V6.00698ZM19.5 17.993C20.8141 16.3506 21.6 14.2671 21.6 12C21.6 9.73293 20.8141 7.64943 19.5 6.00698V17.993ZM8.3833 17.1H15.6167L12 9.86658L8.3833 17.1ZM6.9 14.7L10.8 6.9H6.9V14.7ZM17.1 14.7V6.9H13.2L17.1 14.7ZM12 2.4C9.73294 2.4 7.64945 3.18587 6.00701 4.5H17.993C16.3506 3.18587 14.2671 2.4 12 2.4Z"
      />
    </svg>
  );
}

export function SiteHeader({
  currentPath,
  sticky = true,
}: {
  currentPath: string;
  sticky?: boolean;
}) {
  const path = currentPath.replace(/\/$/, "") || "/";

  return (
    <header
      className={`z-50 border-b border-(--color-border-subtle) bg-background ${sticky ? "sticky top-0" : ""}`}
    >
      <div className="page-shell">
        <div className="relative flex h-(--space-16) items-center justify-between">
          <a
            href="/"
            aria-label={SITE_NAME}
            className="flex items-center gap-(--space-4) rounded-sm text-sm leading-(--leading-label) font-(--font-weight-label) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <LogoMark />
            <span aria-hidden="true" className="h-3.75 w-px bg-border" />
            <span>{SITE_NAME}</span>
          </a>
          <nav
            aria-label="Primary"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-(--space-1) md:flex"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="nav-pill"
                aria-current={isActive(item.href, path) ? "page" : undefined}
              >
                {item.title}
              </a>
            ))}
          </nav>
          <Button
            nativeButton={false}
            render={<a href={GET_IN_TOUCH_HREF} />}
            className="hidden md:inline-flex"
          >
            Get in touch
          </Button>
          <MenuPrimitive.Root>
            <MenuPrimitive.Trigger
              className="p-(--space-2) data-popup-open:bg-(--color-surface) md:hidden"
              render={(props, state) => (
                <Button
                  size="icon"
                  {...props}
                  aria-label={state.open ? "Close menu" : "Open menu"}
                >
                  {state.open ? (
                    <XIcon className="size-4" />
                  ) : (
                    <MenuIcon className="size-4" />
                  )}
                </Button>
              )}
            />
            <MenuPrimitive.Portal>
              <MenuPrimitive.Positioner
                align="end"
                sideOffset={8}
                className="z-50 outline-none md:hidden"
              >
                <MenuPrimitive.Popup className="flex w-40 flex-col gap-(--space-2) rounded-md border border-border bg-background p-(--space-2) outline-none">
                  {NAV_ITEMS.map((item) => (
                    <MenuPrimitive.LinkItem
                      key={item.href}
                      href={item.href}
                      closeOnClick
                      className="nav-pill nav-menu-item outline-none"
                      aria-current={
                        isActive(item.href, path) ? "page" : undefined
                      }
                    >
                      {item.title}
                    </MenuPrimitive.LinkItem>
                  ))}
                  <MenuPrimitive.LinkItem
                    href={GET_IN_TOUCH_HREF}
                    closeOnClick
                    className="nav-pill nav-menu-item nav-menu-action outline-none"
                    aria-current={
                      isActive(GET_IN_TOUCH_HREF, path) ? "page" : undefined
                    }
                  >
                    Get in touch
                  </MenuPrimitive.LinkItem>
                </MenuPrimitive.Popup>
              </MenuPrimitive.Positioner>
            </MenuPrimitive.Portal>
          </MenuPrimitive.Root>
        </div>
      </div>
    </header>
  );
}
