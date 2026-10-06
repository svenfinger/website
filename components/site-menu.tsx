import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { MenuIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { GET_IN_TOUCH_HREF, NAV_ITEMS, isActive } from "@/src/lib/site";

export function SiteMenu({ currentPath }: { currentPath: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    document.addEventListener("astro:before-preparation", closeMenu);
    return () => {
      document.removeEventListener("astro:before-preparation", closeMenu);
    };
  }, []);

  return (
    <MenuPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
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
          <MenuPrimitive.Popup className="flex w-40 origin-(--transform-origin) flex-col gap-(--space-2) rounded-md border border-border bg-background p-(--space-2) outline-none transition-[scale,opacity] duration-(--duration-default) ease-(--ease-enter) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-(--duration-fast) data-ending-style:ease-(--ease-exit) motion-reduce:transition-none motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100">
            {NAV_ITEMS.map((item) => (
              <MenuPrimitive.LinkItem
                key={item.href}
                href={item.href}
                closeOnClick
                className="nav-pill nav-menu-item outline-none"
                aria-current={
                  isActive(item.href, currentPath) ? "page" : undefined
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
                isActive(GET_IN_TOUCH_HREF, currentPath) ? "page" : undefined
              }
            >
              Get in touch
            </MenuPrimitive.LinkItem>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
