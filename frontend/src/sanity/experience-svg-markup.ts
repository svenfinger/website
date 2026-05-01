import type {EXPERIENCE_LIST_QUERY_RESULT} from '../../sanity.types'
import {urlFor} from './image'
import {sanitizeInlineSvg} from './sanitize-inline-svg'

export type ExperienceRowWithSvg = EXPERIENCE_LIST_QUERY_RESULT[number] & {
  svgInlineMarkup?: string | null
}

export async function enrichExperiencesWithSvgMarkup(
  rows: EXPERIENCE_LIST_QUERY_RESULT | null,
): Promise<ExperienceRowWithSvg[] | null> {
  if (rows == null) return null
  if (rows.length === 0) return rows

  const refToMarkup = new Map<string, string>()
  const refsNeeded = new Set<string>()

  for (const row of rows) {
    const ref = row.icon?.asset?._ref
    if (ref && row.icon?.mimeType === 'image/svg+xml') refsNeeded.add(ref)
  }

  await Promise.all(
    [...refsNeeded].map(async (ref) => {
      const icon = rows.find((r) => r.icon?.asset?._ref === ref)?.icon
      if (!icon?.asset?._ref) return
      try {
        const res = await fetch(urlFor(icon).width(96).url(), {
          next: {revalidate: 30},
        })
        if (!res.ok) return
        const safe = sanitizeInlineSvg(await res.text())
        if (safe) refToMarkup.set(ref, safe)
      } catch {
        /* mask / raster fallback in UI */
      }
    }),
  )

  return rows.map((row): ExperienceRowWithSvg => {
    const ref = row.icon?.asset?._ref
    const svgInlineMarkup = ref ? refToMarkup.get(ref) : undefined
    return svgInlineMarkup ? {...row, svgInlineMarkup} : row
  })
}
