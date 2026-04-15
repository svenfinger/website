import {ComposeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'introBlock',
  title: 'Intro',
  type: 'object',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'Short line above the heading',
    }),
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
          validation: Rule => Rule.uri({
            scheme: ['http', 'https', 'mailto', 'tel']
          }),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      eyebrow: 'eyebrow',
      heading: 'heading',
      media: 'image',
    },
    prepare({eyebrow, heading, media}) {
      return {
        title: heading || 'Intro',
        subtitle: eyebrow,
        media,
      }
    },
  },
})
