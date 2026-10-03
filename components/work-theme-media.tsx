import { useState } from "react";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";

type ThemeImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function WorkThemeMedia({
  light,
  dark,
}: {
  light: ThemeImage;
  dark: ThemeImage;
}) {
  const [theme, setTheme] = useState("light");

  return (
    <section
      className="work-block work-block--media"
      aria-label="Light and dark appearance"
    >
      <div className="work-theme-media">
        {[
          { theme: "light", image: light },
          { theme: "dark", image: dark },
        ].map(({ theme: imageTheme, image }) => (
          <img
            key={imageTheme}
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
            hidden={theme !== imageTheme}
          />
        ))}
        <ToggleGroup
          className="work-theme-toggle"
          aria-label="Image appearance"
          value={[theme]}
          onValueChange={(value) => {
            if (value.length) setTheme(value[0]);
          }}
        >
          <Toggle value="light">Light</Toggle>
          <Toggle value="dark">Dark</Toggle>
        </ToggleGroup>
      </div>
    </section>
  );
}
