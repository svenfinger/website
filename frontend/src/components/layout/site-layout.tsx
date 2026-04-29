import { Footer, type FooterMenuItem } from "./footer";
import { Header } from "./header";

export function SiteLayout({
  children,
  footerMenu,
}: {
  children: React.ReactNode;
  footerMenu: FooterMenuItem[];
}) {
  return (
    <div className="w-full mx-auto max-w-2xl px-6 py-12 md:py-24">
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:text-foreground-primary focus-visible:outline-2 focus-visible:outline-interactive-primary-default"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex flex-col">
        {children}
      </main>
      <Footer menuItems={footerMenu} />
    </div>
  );
}
