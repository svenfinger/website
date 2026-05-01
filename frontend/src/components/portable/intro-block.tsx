import Image from 'next/image'
import Link from 'next/link'
import type {PortableTextComponents} from 'next-sanity'
import {PortableText} from 'next-sanity'
import {PhosphorIcon, type PhosphorIconName} from '@/components/icons/phosphor-icon'
import {getSiteConfig} from '@/sanity/site-config'
import {urlFor} from '@/sanity/image'
import type {IntroBlock as IntroBlockFields} from '../../../sanity.types'

export type IntroBlockValue = IntroBlockFields & {_key: string}

type SocialPlatform = 'github' | 'x' | 'linkedin' | 'dribbble'
type ValidSocialProfile = {
  _key: string
  platform: SocialPlatform
  url: string
}

const PLATFORM_ICONS: Record<SocialPlatform, PhosphorIconName> = {
  github: 'GithubLogo',
  x: 'XLogo',
  linkedin: 'LinkedinLogo',
  dribbble: 'DribbbleLogo',
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  github: 'GitHub',
  x: 'X',
  linkedin: 'LinkedIn',
  dribbble: 'Dribbble',
}

function isValidSocialProfile(p: unknown): p is ValidSocialProfile {
  return (
    typeof p === 'object' &&
    p !== null &&
    typeof (p as ValidSocialProfile)._key === 'string' &&
    typeof (p as ValidSocialProfile).platform === 'string' &&
    typeof (p as ValidSocialProfile).url === 'string'
  )
}

export async function IntroBlock({
  value,
  components,
}: {
  value: IntroBlockValue
  components: PortableTextComponents
}) {
  const config = await getSiteConfig()
  const socialProfiles: ValidSocialProfile[] =
    config?.socialProfiles?.filter(isValidSocialProfile) ?? []
  return (
    <section className="py-12 md:py-24">
      <div className="border-border-subtle mb-12 flex items-center gap-4 border-b pb-6">
        {value.image && value.image.asset?._ref ? (
          <Image
            src={urlFor(value.image).width(96).auto('format').url()}
            alt={value.heading || value.eyebrow || ''}
            width={96}
            height={96}
            className="w-12 rounded-full"
          />
        ) : null}
        <div className="flex flex-col">
          {value.heading ? <h2 className="font-medium">{value.heading}</h2> : null}
          {value.eyebrow ? <p className="text-foreground-secondary">{value.eyebrow}</p> : null}
        </div>
      </div>
      {value.content?.length ? (
        <div className="mb-6">
          <PortableText value={value.content} components={components} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {value.link?.url && value.link?.label ? (
          <Link
            href={value.link.url}
            className="text-interactive-primary-default hover:text-interactive-primary-hover inline-flex items-center gap-1 font-medium"
          >
            {value.link.label}
            <PhosphorIcon
              name="CaretRight"
              weight="bold"
              className="relative top-[1.5px] h-3.5 w-3.5"
              aria-hidden
            />
          </Link>
        ) : null}
        {socialProfiles.length > 0 ? (
          <div className="flex items-center gap-3">
            {socialProfiles.map((profile) => {
              const iconName = PLATFORM_ICONS[profile.platform]
              if (!iconName) return null
              return (
                <a
                  key={profile._key}
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={PLATFORM_LABELS[profile.platform] ?? profile.platform}
                  className="text-foreground-secondary hover:text-foreground-primary -m-0.5 p-0.5"
                >
                  <PhosphorIcon name={iconName} weight="regular" className="h-5 w-5" aria-hidden />
                </a>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
