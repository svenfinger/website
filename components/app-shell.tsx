import { Fragment, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";

export type AppBreadcrumb = {
  label: string;
  href?: string;
};

export function AppShell({
  currentPath,
  breadcrumbs,
  workCount,
  projectCount,
  children,
}: {
  currentPath: string;
  breadcrumbs: AppBreadcrumb[];
  workCount: number;
  projectCount: number;
  children?: ReactNode;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="md:w-[calc(100%+var(--scrollbar-size))]">
        <AppSidebar
          currentPath={currentPath}
          workCount={workCount}
          projectCount={projectCount}
        />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <Fragment key={`${item.label}-${index}`}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink render={<a href={item.href} />}>
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
