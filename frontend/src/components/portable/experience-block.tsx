import Image from "next/image";
import Link from "next/link";
import type { PortableTextComponents } from "next-sanity";
import { PortableText } from "next-sanity";
import { PhosphorIcon } from "@/components/icons/phosphor-icon";
import { urlFor } from "@/sanity/image";
import type {
  EXPERIENCE_LIST_QUERY_RESULT,
  ExperienceBlock as ExperienceBlockFields,
} from "../../../sanity.types";

export type ExperienceBlockValue = ExperienceBlockFields & { _key: string };
type ExperienceRow = EXPERIENCE_LIST_QUERY_RESULT[number];

export function ExperienceBlock({
  value,
  experiences,
  components,
}: {
  value: ExperienceBlockValue;
  experiences: ExperienceRow[] | null;
  components: PortableTextComponents;
}) {
  const list = experiences ?? [];

  return (
    <section className="py-12 md:py-24" aria-labelledby={value.heading ? "experience-block-heading" : undefined}>
      {value.heading ? (
        <h2
          id="experience-block-heading"
          className="text-5xl font-serif pb-6 border-b border-border-subtle mb-12"
        >
          {value.heading}
        </h2>
      ) : null}

      <div className="not-editor">
        {list.length === 0 ? (
          <p className="text-foreground-secondary">No experience yet.</p>
        ) : (
          <ol className="space-y-12 mb-12">
            {list.map((experience) => (
              <li key={experience._id} className="flex flex-col md:flex-row gap-6">
                {experience.icon?.asset?._ref ? (
                  <div className="rounded-xl w-12 h-12 shrink-0 border border-border-subtle" aria-hidden>
                    <Image
                      src={urlFor(experience.icon).width(96).auto("format").url()}
                      alt={experience.company || ""}
                      width={96}
                      height={96}
                      className="rounded-full w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="rounded-full w-12 h-12 shrink-0 bg-border-subtle" aria-hidden />
                )}
                <div className="grow">
                  <h3 className="font-medium mb-3">
                    <span className="flex gap-2">
                      <span className="grow">{experience.company}</span>
                      {experience.timeframe ? (
                        <span className="text-foreground-secondary font-normal shrink-0">
                          {experience.timeframe}
                        </span>
                      ) : null}
                    </span>
                    {experience.role ? (
                      <span className="block text-foreground-secondary font-normal">
                        {experience.role}
                      </span>
                    ) : null}
                  </h3>
                  {experience.description ? (
                    <p>
                      {experience.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {value.content?.length ? (
        <div className="editor border-t border-border-subtle border-dotted pt-12 mb-6">
          <PortableText value={value.content} components={components} />
        </div>
      ) : null}

      {value.link?.url && value.link?.label ? (
        <Link
          href={value.link.url}
          className="inline-flex items-center gap-1 font-medium text-interactive-primary-default hover:text-interactive-primary-hover"
        >
          {value.link.label}
          <PhosphorIcon
            name="CaretRight"
            weight="bold"
            className="w-3.5 h-3.5 relative top-[1.5px]"
            aria-hidden
          />
        </Link>
      ) : null}
    </section>
  );
}
