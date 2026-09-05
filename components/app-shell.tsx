import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({
  currentPath,
  title,
}: {
  currentPath: string;
  title: string;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar currentPath={currentPath} />
        <SidebarInset>
          <header className="flex h-12 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-6">
            <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
