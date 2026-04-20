import {CaseIcon, CogIcon} from '@sanity/icons'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import type {StructureResolver} from 'sanity/structure'

const SINGLETONS = ['configuration']
const ORDERABLE_TYPES = ['experience']

export const structure: StructureResolver = (S, context) =>
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
      orderableDocumentListDeskItem({
        type: 'experience',
        title: 'Experience',
        icon: CaseIcon,
        S,
        context,
      }),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId() as string
        return !SINGLETONS.includes(id) && !ORDERABLE_TYPES.includes(id)
      }),
    ])
