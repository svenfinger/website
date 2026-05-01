import type {Metadata} from 'next'
import {Instrument_Serif, Inter} from 'next/font/google'
import {SiteLayout} from '@/components/layout/site-layout'
import {getSiteConfig} from '@/sanity/site-config'
import {urlFor} from '@/sanity/image'
import './globals.css'
import {Analytics} from '@vercel/analytics/next'
import {SpeedInsights} from '@vercel/speed-insights/next'

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: ['400'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  const image = config?.socialShareImage
  const hasAsset = Boolean(image?.asset)
  const siteTitle = config?.siteTitle ?? undefined
  const siteDescription = config?.siteDescription ?? undefined

  const baseMetadata: Metadata = {
    ...(siteTitle ? {title: {default: siteTitle, template: `%s — ${siteTitle}`}} : {}),
    ...(siteDescription ? {description: siteDescription} : {}),
  }

  const metadataBase =
    process.env.NEXT_PUBLIC_SITE_URL !== undefined && process.env.NEXT_PUBLIC_SITE_URL !== ''
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined

  if (!hasAsset || !image) {
    return {...baseMetadata, ...(metadataBase ? {metadataBase} : {})}
  }

  const ogWidth = 1200
  const ogHeight = 630
  const imageUrl = urlFor(image).width(ogWidth).height(ogHeight).fit('crop').auto('format').url()

  return {
    ...baseMetadata,
    ...(metadataBase ? {metadataBase} : {}),
    openGraph: {
      images: [
        {
          url: imageUrl,
          width: ogWidth,
          height: ogHeight,
          ...(image.alt ? {alt: image.alt} : {}),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [imageUrl],
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const config = await getSiteConfig()

  const footerMenu = config?.footerMenu?.filter(Boolean) ?? []

  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable} antialiased`}>
      <body className="bg-background text-foreground-primary text-lg">
        <SiteLayout footerMenu={footerMenu}>{children}</SiteLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
