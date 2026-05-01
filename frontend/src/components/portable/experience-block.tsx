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
    <section
      className="py-12 md:py-24"
      aria-labelledby={value.heading ? "experience-block-heading" : undefined}
    >
      {value.heading ? (
        <h2
          id="experience-block-heading"
          className="border-border-subtle mb-12 border-b pb-6 font-serif text-5xl"
        >
          {value.heading}
        </h2>
      ) : null}

      <div className="not-editor">
        {list.length === 0 ? (
          <p className="text-foreground-secondary">No experience yet.</p>
        ) : (
          <ol className="mb-12 space-y-12">
            {list.map((experience) => (
              <li key={experience._id} className="flex flex-col gap-6 md:flex-row">
                {experience.icon?.asset?._ref ? (
                  <div
                    className="border-border-subtle h-12 w-12 shrink-0 rounded-xl border"
                    aria-hidden
                  >
                    <Image
                      src={urlFor(experience.icon).width(96).auto("format").url()}
                      alt={experience.company || ""}
                      width={96}
                      height={96}
                      className="h-full w-full rounded-full"
                    />
                  </div>
                ) : (
                  <div className="bg-border-subtle h-12 w-12 shrink-0 rounded-full" aria-hidden />
                )}
                <div className="grow">
                  <h3 className="mb-3 font-medium">
                    <span className="flex gap-2">
                      <span className="grow">{experience.company}</span>
                      {experience.timeframe ? (
                        <span className="text-foreground-secondary shrink-0 font-normal">
                          {experience.timeframe}
                        </span>
                      ) : null}
                    </span>
                    {experience.role ? (
                      <span className="text-foreground-secondary block font-normal">
                        {experience.role}
                      </span>
                    ) : null}
                  </h3>
                  {experience.description ? <p>{experience.description}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {value.content?.length ? (
        <div className="editor border-border-subtle mb-6 border-t border-dotted pt-12">
          <PortableText value={value.content} components={components} />
        </div>
      ) : null}

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
    </section>
  );
}
