import {defineQuery} from 'next-sanity'
import {cache} from 'react'
import {client} from '@/sanity/client'

export const SITE_CONFIG_QUERY = defineQuery(`*[_id == "configuration"][0]{
  siteTitle,
  siteDescription,
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
  },
  socialProfiles[]{
    _key,
    platform,
    url
  }
}`)

export const getSiteConfig = cache(() =>
  client.fetch(SITE_CONFIG_QUERY, {}, {next: {revalidate: 30}}),
)
