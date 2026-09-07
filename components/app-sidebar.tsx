import {
  InfoIcon,
  BriefcaseBusinessIcon,
  AtSignIcon,
  ShieldLockIcon,
  CircleUserRoundIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const items = [
  { title: "Work", url: "/", icon: BriefcaseBusinessIcon },
  { title: "About", url: "/about", icon: CircleUserRoundIcon },
  { title: "Socials", url: "/socials", icon: AtSignIcon },
];

const footerItems = [
  { title: "Privacy", url: "/privacy", icon: ShieldLockIcon },
  { title: "Imprint", url: "/imprint", icon: InfoIcon },
];

function isActive(url: string, path: string) {
  if (url === "/") {
    return path === "/" || path.startsWith("/work/");
  }

  return url === path;
}

export function AppSidebar({ currentPath }: { currentPath: string }) {
  const path = currentPath.replace(/\/$/, "") || "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<a href="/" />}
              size="lg"
              tooltip="Sven Finger"
            >
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-sidebar-primary text-sidebar-primary-foreground">
                <svg
                  viewBox="0 0 7 3"
                  fill="currentColor"
                  aria-hidden="true"
                  className="size-5.5!"
                >
                  <rect x="1" y="0" width="2" height="1" />
                  <rect x="4" y="0" width="1" height="3" />
                  <rect x="5" y="0" width="2" height="1" />
                  <rect x="0" y="1" width="1" height="1" />
                  <rect x="1" y="2" width="2" height="1" />
                  <rect x="5" y="2" width="2" height="1" />
                </svg>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Sven Finger</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    tooltip={item.title}
                    isActive={isActive(item.url, path)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={<a href={item.url} />}
                tooltip={item.title}
                isActive={item.url === path}
                size="sm"
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
