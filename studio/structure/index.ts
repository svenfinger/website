import {CogIcon} from '@sanity/icons'
import type {StructureResolver} from 'sanity/structure'

const SINGLETONS = ['configuration']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Configuration')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('configuration')
            .documentId('configuration')
            .title('Configuration'),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETONS.includes(listItem.getId() as string),
      ),
    ])
