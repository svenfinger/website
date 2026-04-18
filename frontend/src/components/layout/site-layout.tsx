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
    <div className="w-full mx-auto max-w-2xl px-6 py-24">
      <Header />
      <div className="flex flex-col">{children}</div>
      <Footer menuItems={footerMenu} />
    </div>
  );
}
