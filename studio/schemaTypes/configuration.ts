import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'configuration',
  title: 'Configuration',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site title',
      type: 'string',
      description: 'Your name or site name shown in browser tab titles and metadata.',
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site description',
      type: 'string',
      description: 'Short bio or tagline used as the default meta description.',
    }),
    defineField({
      name: 'socialProfiles',
      title: 'Social profiles',
      description: 'Links to your profiles shown as icons in the intro block.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialProfile',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'GitHub', value: 'github'},
                  {title: 'X', value: 'x'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'Dribbble', value: 'dribbble'},
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['https']}),
            }),
          ],
          preview: {
            select: {platform: 'platform', url: 'url'},
            prepare({platform, url}) {
              const labels: Record<string, string> = {
                github: 'GitHub',
                x: 'X',
                linkedin: 'LinkedIn',
                dribbble: 'Dribbble',
              }
              return {
                title: labels[platform] ?? platform,
                subtitle: url,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'homePage',
      title: 'Home page',
      description: 'Content for the site index (/). Pick any page document.',
      type: 'reference',
      to: [{type: 'page'}],
    }),
    defineField({
      name: 'footerMenu',
      title: 'Footer menu',
      description: 'Pages shown in the site footer. Order here matches order on the site.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'page'}],
          options: {
            disableNew: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'socialShareImage',
      title: 'Social share image',
      description:
        'Default Open Graph / Twitter image (about 1200×630). Used for all pages until per-document images exist.',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          description: 'Describe the image for screen readers and social previews.',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      homeTitle: 'homePage.title',
    },
    prepare({homeTitle}) {
      return {
        title: 'Configuration',
        subtitle: homeTitle ? `Home page: ${homeTitle}` : 'Site-wide settings',
      }
    },
  },
})
