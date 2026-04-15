import Image from "next/image";
import Link from "next/link";
import type { PortableTextComponents } from "next-sanity";
import { PortableText } from "next-sanity";
import { PhosphorIcon } from "@/components/icons/phosphor-icon";
import { urlFor } from "@/sanity/image";
import type { IntroBlock as IntroBlockFields } from "../../../sanity.types";

export type IntroBlockValue = IntroBlockFields & { _key: string };

export function IntroBlock({
  value,
  components,
}: {
  value: IntroBlockValue;
  components: PortableTextComponents;
}) {
  return (
    <section className="py-24">
      <div className="flex items-center gap-4 mb-12 pb-6 border-b border-border-subtle">
        {value.image && value.image.asset?._ref ? (
          <Image
            src={urlFor(value.image).width(96).auto("format").url()}
            alt={value.heading || value.eyebrow || ""}
            width={96}
            height={96}
            className="rounded-full w-12"
          />
        ) : null}
        <div className="flex flex-col">
          {value.heading ? (
            <h2 className="font-medium">{value.heading}</h2>
          ) : null}
          {value.eyebrow ? (
            <p className="text-foreground-secondary">
              {value.eyebrow}
            </p>
          ) : null}
        </div>
      </div>
      {value.content?.length ? (
        <div className="mb-6">
          <PortableText value={value.content} components={components} />
        </div>
      ) : null}
      {value.link?.url && value.link?.label ? (
        <Link
          href={value.link.url}
          className="inline-flex items-center gap-1 font-medium text-interactive-primary-default hover:text-interactive-primary-hover"
        >
          {value.link.label}
          <PhosphorIcon name="CaretRight" weight="bold" className="w-3.5 h-3.5 relative top-[1.5px]" />
        </Link>
      ) : null}
    </section>
  );
}
