import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { defineQuery } from "next-sanity";
import { SiteLayout } from "@/components/layout/site-layout";
import { client } from "@/sanity/client";
import type { FOOTER_MENU_QUERY_RESULT } from "../../sanity.types";
import "./globals.css";

const FOOTER_MENU_QUERY = defineQuery(`*[_id == "configuration"][0]{
  footerMenu[]->{
    _id,
    title,
    slug
  }
}`);

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sven Finger",
  description: "Full-Stack Design Engineer",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await client.fetch<FOOTER_MENU_QUERY_RESULT>(
    FOOTER_MENU_QUERY,
    {},
    { next: { revalidate: 30 } }
  );

  const footerMenu = config?.footerMenu?.filter(Boolean) ?? [];

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-background text-foreground-primary text-lg">
        <SiteLayout footerMenu={footerMenu}>{children}</SiteLayout>
      </body>
    </html>
  );
}
