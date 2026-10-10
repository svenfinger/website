import { useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

type MediaOption = {
  label: string;
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
};

export function WorkMediaToggle({
  label,
  toggleLabel,
  options,
}: {
  label: string;
  toggleLabel: string;
  options: MediaOption[];
}) {
  const [selected, setSelected] = useState(options[0].label);

  return (
    <section className="work-block work-block--media" aria-label={label}>
      <div className="work-toggle-media">
        {options.map((image) => (
          <img
            key={image.label}
            src={image.src}
            srcSet={image.srcSet}
            sizes={image.sizes}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            hidden={selected !== image.label}
          />
        ))}
        <ToggleGroup
          className="work-media-toggle header-backdrop"
          aria-label={toggleLabel}
          value={[selected]}
          onValueChange={(value) => {
            if (value.length) setSelected(value[0]);
          }}
        >
          {options.map((image) => (
            <Toggle key={image.label} value={image.label}>
              {image.label}
            </Toggle>
          ))}
        </ToggleGroup>
      </div>
    </section>
  );
}
