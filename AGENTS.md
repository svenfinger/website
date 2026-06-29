# AGENTS.md

Guidance for AI agents working in this repo.

## Project

Personal portfolio: Astro + Tailwind CSS v4 + MDX, deployed to Cloudflare Pages. Use `pnpm`. Requires Node >= 22.12.

## Design system sync (Figma → CSS)

Colors and typography are owned by the Figma **Design System** file and mirrored into CSS by hand (the account is not on Figma Enterprise, so the Variables REST API is unavailable). There is **no build step and no token JSON** — the agent reads Figma directly via the Figma MCP (`use_figma`) and writes the CSS files. The user triggers a re-sync from chat whenever the design system changes.

- **Figma file:** https://www.figma.com/design/2PxfGXZvWP48L7RtfkD5ff/Design-System
- **fileKey:** `FILEKEY`
- Before any `use_figma` call, load the `figma-use` skill (mandatory).

The file has two variable collections: **Primitives** (the Tailwind-equivalent color ramp — ignore, it maps to Tailwind defaults) and **Semantics** (Light/Dark modes — this is what we mirror). Text styles follow the same split: `Primitives/*` ramps equal Tailwind defaults; `Semantics/*` are the ones we mirror.

Do **not** hand-edit values in `src/styles/tokens.css` or `src/styles/typography.css` — re-sync from Figma instead.

### Syncing design tokens (colors) → `src/styles/tokens.css`

1. Read the Semantics variables and their per-mode alias targets:

   ```js
   // use_figma, fileKey FILEKEY
   const collections = await figma.variables.getLocalVariableCollectionsAsync();
   const sem = collections.find((c) => c.name === "Semantics");
   const modeName = Object.fromEntries(sem.modes.map((m) => [m.modeId, m.name]));
   const out = [];
   for (const id of sem.variableIds) {
     const v = await figma.variables.getVariableByIdAsync(id);
     const perMode = {};
     for (const [modeId, val] of Object.entries(v.valuesByMode)) {
       if (val && val.type === "VARIABLE_ALIAS") {
         const t = await figma.variables.getVariableByIdAsync(val.id);
         perMode[modeName[modeId]] = t ? t.name : val.id;
       } else {
         perMode[modeName[modeId]] = val;
       }
     }
     out.push({ name: v.name, values: perMode });
   }
   return out;
   ```

2. Map each variable into the CSS in `src/styles/tokens.css`:
   - Variable name `Colors/Foreground/Primary` → semantic var `--semantic-foreground-primary` and Tailwind utility `--color-foreground-primary` (drop the leading `Colors/`, kebab-case the rest).
   - Alias target `Colors/Gray/500` → `var(--color-gray-500)`; `Colors/Basic/White` → `var(--color-white)`; `Colors/Basic/Black` → `var(--color-black)`; `Colors/Blue/600` → `var(--color-blue-600)`. (These are Tailwind's default color variables.)
   - `Light` mode values go in `:root`; `Dark` mode values go in the `@media (prefers-color-scheme: dark) :root` block.
3. Keep the file's three sections: `@theme inline` (utility → semantic var), `:root` (light), and the dark media query. Keep entries sorted alphabetically.

### Syncing text styles → `src/styles/typography.css`

1. Read the local text styles:

   ```js
   // use_figma, fileKey FILEKEY
   const styles = await figma.getLocalTextStylesAsync();
   return styles.map((s) => ({
     name: s.name,
     fontFamily: s.fontName.family,
     fontStyle: s.fontName.style,
     fontSize: s.fontSize,
     lineHeight: s.lineHeight,
     letterSpacing: s.letterSpacing,
   }));
   ```

2. Mirror **only** the `Semantics/*` styles (skip `Primitives/*` — they equal Tailwind's default `text-*` ramp). For each, write an `@utility` in `src/styles/typography.css`:
   - Name: `Semantics/Headline/Large` → `text-headline-large`; `Semantics/Body/Large Bold` → `text-body-large-bold` (drop `Semantics/`, kebab-case).
   - `font-family`: `Inter Display` → `var(--font-display)`, `Inter` → `var(--font-sans)`.
   - `font-weight`: `Regular` → 400, `Medium` → 500, `SemiBold` → 600.
   - `font-size` / `line-height`: convert px → rem (÷16); keep a `/* Npx */` comment.
   - `letter-spacing`: keep in px (or `0`).

### After any sync

- Both CSS files are imported by `src/styles/global.css` (`tokens.css`, then `typography.css`).
- Verify with `pnpm build` (Tailwind compiles `@utility` / `@theme` at build time).
- Report what changed (added/removed/updated tokens or styles).

## Conventions

- Tailwind v4: custom utilities via `@utility`, theme values via `@theme`. No `tailwind.config.js`.
- Use semantic utilities in markup (`bg-background-primary`, `text-headline-large`), not raw primitives/hex.
- Only commit when the user explicitly asks.
