import {CogIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export default defineType({
  name: 'configuration',
  title: 'Configuration',
  type: 'document',
  icon: CogIcon,
  fields: [
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
  ],
  preview: {
    select: {
      homeTitle: 'homePage.title',
    },
    prepare({homeTitle}) {
      return {
        title: 'Configuration',
        subtitle: homeTitle
          ? `Home page: ${homeTitle}`
          : 'Site-wide settings',
      }
    },
  },
})
