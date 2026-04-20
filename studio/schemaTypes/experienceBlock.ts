import {CaseIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Lists all experience entries on the site, with editor copy and an optional link. */
export default defineType({
  name: 'experienceBlock',
  title: 'Experience list',
  type: 'object',
  icon: CaseIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'content',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          validation: (rule) =>
            rule.uri({
              scheme: ['http', 'https', 'mailto', 'tel'],
            }),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
    },
    prepare({heading}) {
      return {
        title: heading || 'Experience list',
        subtitle: 'Renders all experience entries',
      }
    },
  },
})
