import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { defineQuery } from "next-sanity";
import { cache } from "react";
import { SiteLayout } from "@/components/layout/site-layout";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/image";
import type { SITE_CONFIG_QUERY_RESULT } from "../../sanity.types";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE_CONFIG_QUERY = defineQuery(`*[_id == "configuration"][0]{
  footerMenu[]->{
    _id,
    title,
    slug
  },
  socialShareImage{
    asset,
    alt,
    hotspot,
    crop
  }
}`);

const getSiteConfig = cache(() =>
  client.fetch<SITE_CONFIG_QUERY_RESULT>(
    SITE_CONFIG_QUERY,
    {},
    { next: { revalidate: 30 } }
  )
);

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultMetadata: Metadata = {
  title: {
    default: "Sven Finger",
    template: "%s — Sven Finger",
  },
  description: "Full-Stack Design Engineer",
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const image = config?.socialShareImage;
  const hasAsset = Boolean(image?.asset);

  const metadataBase =
    process.env.NEXT_PUBLIC_SITE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SITE_URL !== ""
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined;

  if (!hasAsset || !image) {
    return { ...defaultMetadata, ...(metadataBase ? { metadataBase } : {}) };
  }

  const ogWidth = 1200;
  const ogHeight = 630;
  const imageUrl = urlFor(image).width(ogWidth).height(ogHeight).fit("crop").auto("format").url();

  return {
    ...defaultMetadata,
    ...(metadataBase ? { metadataBase } : {}),
    openGraph: {
      images: [
        {
          url: imageUrl,
          width: ogWidth,
          height: ogHeight,
          ...(image.alt ? { alt: image.alt } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [imageUrl],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getSiteConfig();

  const footerMenu = config?.footerMenu?.filter(Boolean) ?? [];

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} antialiased`}
    >
      <body className="bg-background text-foreground-primary text-lg">
        <SiteLayout footerMenu={footerMenu}>{children}</SiteLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
