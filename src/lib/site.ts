export const SITE_NAME = "Sven Finger";
export const SITE_DESCRIPTION =
  "Full-stack design engineer from Hamburg, Germany.";

export const NAV_ITEMS = [
  { title: "Work", href: "/" },
  { title: "Projects", href: "/projects" },
  { title: "About", href: "/about" },
] as const;

export const GET_IN_TOUCH_HREF = "/contact";

export function isActive(href: string, currentPath: string) {
  const path = currentPath.replace(/\/$/, "") || "/";
  if (href === "/") return path === "/" || path.startsWith("/work/");
  return href === path;
}
