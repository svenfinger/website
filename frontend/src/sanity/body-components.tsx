import Image from 'next/image'
import type {PortableTextComponents} from 'next-sanity'
import {ExperienceBlock} from '@/components/portable/experience-block'
import {IntroBlock} from '@/components/portable/intro-block'
import {NotesBlock} from '@/components/portable/notes-block'
import type {ExperienceRowWithSvg} from '@/sanity/experience-svg-markup'
import {urlFor} from '@/sanity/image'
import type {NOTES_LIST_QUERY_RESULT} from '../../sanity.types'

function imageBlock({value}: {value: {asset?: {_ref?: string}; alt?: string}}) {
  if (!value?.asset?._ref) return null
  return (
    <Image
      src={urlFor(value).width(800).auto('format').url()}
      alt={value.alt || ''}
      width={800}
      height={450}
      className="my-8 rounded-lg"
    />
  )
}

export function createBodyComponents(options?: {
  notes?: NOTES_LIST_QUERY_RESULT | null
  experiences?: ExperienceRowWithSvg[] | null
}): PortableTextComponents {
  const notes = options?.notes ?? null
  const experiences = options?.experiences ?? null

  const components: PortableTextComponents = {
    types: {
      image: imageBlock,
      introBlock: ({value}) => <IntroBlock value={value} components={components} />,
      notesBlock: () => <NotesBlock notes={notes} />,
      experienceBlock: ({value}) => (
        <ExperienceBlock value={value} experiences={experiences} components={components} />
      ),
    },
  }

  return components
}
