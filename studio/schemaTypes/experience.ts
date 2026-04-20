import {CaseIcon} from '@sanity/icons'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'experience',
  title: 'Experience',
  type: 'document',
  icon: CaseIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'company',
      title: 'Company name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'timeframe',
      title: 'Timeframe',
      type: 'string',
      description: 'For example "2021 – Present" or "Jan 2020 – Mar 2022"',
    }),
    orderRankField({type: 'experience'}),
  ],
  preview: {
    select: {
      title: 'company',
      subtitle: 'role',
      media: 'icon',
    },
  },
})
