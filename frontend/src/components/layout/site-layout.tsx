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
    <div className="w-full mx-auto max-w-2xl px-6 py-12 md:py-24 stagger-enter">
      <Header />
      <div className="flex flex-col stagger-enter">{children}</div>
      <Footer menuItems={footerMenu} />
    </div>
  );
}
