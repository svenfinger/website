import { EllipsisIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { GET_IN_TOUCH_HREF, NAV_ITEMS, SITE_NAME } from "@/src/lib/site";

function isActive(href: string, path: string) {
  if (href === "/") {
    return path === "/" || path.startsWith("/work/");
  }

  return href === path;
}

function LogoMark() {
  return (
    <svg
      viewBox="0 0 7 3"
      fill="currentColor"
      aria-hidden="true"
      className="aspect-[7/3] h-3 w-auto"
    >
      <rect x="1" y="0" width="2" height="1" />
      <rect x="4" y="0" width="1" height="3" />
      <rect x="5" y="0" width="2" height="1" />
      <rect x="0" y="1" width="1" height="1" />
      <rect x="1" y="2" width="2" height="1" />
      <rect x="5" y="2" width="2" height="1" />
    </svg>
  );
}

export function SiteHeader({ currentPath }: { currentPath: string }) {
  const path = currentPath.replace(/\/$/, "") || "/";

  return (
    <div className="grid h-12 grid-cols-[1fr_auto] items-center px-6 md:grid-cols-3">
      <a
        href="/"
        aria-label={SITE_NAME}
        className="flex items-center gap-2 justify-self-start"
      >
        <LogoMark />
        <Separator
          orientation="vertical"
          className="hidden data-vertical:h-4 data-vertical:self-auto md:block"
        />
        <span className="hidden text-sm font-medium md:inline">
          {SITE_NAME}
        </span>
      </a>
      <NavigationMenu className="hidden justify-self-center md:flex">
        <NavigationMenuList className="gap-1">
          {NAV_ITEMS.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink
                href={item.href}
                active={isActive(item.href, path)}
                className={navigationMenuTriggerStyle()}
              >
                {item.title}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="justify-self-end">
        <Button
          variant="outline"
          className="hidden md:inline-flex"
          render={<a href={GET_IN_TOUCH_HREF} />}
          nativeButton={false}
        >
          Get in touch
        </Button>
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
              aria-label="Open menu"
            >
              <EllipsisIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-48">
              <DropdownMenuGroup>
                {NAV_ITEMS.map((item) => (
                  <DropdownMenuItem
                    key={item.href}
                    render={<a href={item.href} />}
                    nativeButton={false}
                  >
                    {item.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  render={<a href={GET_IN_TOUCH_HREF} />}
                  nativeButton={false}
                >
                  Get in touch
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
