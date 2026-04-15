import {DocumentsIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

/** Lists all published notes on the site; no editor-facing options. */
export default defineType({
  name: 'notesBlock',
  title: 'Notes list',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'behavior',
      type: 'string',
      initialValue: 'listAllNotes',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Notes list',
        subtitle: 'Renders all notes with a fixed heading',
      }
    },
  },
})
