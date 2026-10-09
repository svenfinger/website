import { WorkMediaToggle } from "./work-media-toggle";

type ThemeImage = {
  src: string;
  srcSet?: string;
  sizes?: string;
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
  return (
    <WorkMediaToggle
      label="Light and dark appearance"
      toggleLabel="Image appearance"
      options={[
        { ...light, label: "Light" },
        { ...dark, label: "Dark" },
      ]}
    />
  );
}
