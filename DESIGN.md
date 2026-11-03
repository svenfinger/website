---
version: alpha
name: Sven Finger portfolio
description: A restrained, dark portfolio with a product-like interface.
colors:
  background: oklch(14.1% 0.005 285.823)
  foreground: oklch(98.5% 0 0)
  muted-foreground: oklch(70.5% 0.015 286.067)
  surface: oklch(21% 0.006 285.885)
  surface-hover: oklch(27.4% 0.006 286.033)
  primary: oklch(54.6% 0.245 262.881)
  accent: "{colors.primary}"
  accent-hover: oklch(62.3% 0.214 259.815)
  accent-foreground: oklch(97% 0.014 254.604)
typography:
  display:
    fontFamily: Inter Variable
    fontSize: 2rem
    fontWeight: 620
    lineHeight: 1.15
    letterSpacing: -0.02em
  heading:
    fontFamily: Inter Variable
    fontSize: 1.25rem
    fontWeight: 580
    lineHeight: 1.25
    letterSpacing: -0.01em
  body:
    fontFamily: Inter Variable
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: Inter Variable
    fontSize: 0.875rem
    fontWeight: 430
    lineHeight: 1.45
  label:
    fontFamily: Inter Variable
    fontSize: 0.75rem
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: 0.01em
  mono:
    fontFamily: Geist Mono Variable
    fontSize: 0.8125rem
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0.01em
spacing:
  space-1: 0.25rem
  space-2: 0.5rem
  space-3: 0.75rem
  space-4: 1rem
  space-6: 1.5rem
  space-8: 2rem
  space-12: 3rem
  space-16: 4rem
  space-24: 6rem
  space-32: 8rem
  gutter-mobile: 1.25rem
  gutter-desktop: 2rem
rounded:
  sm: 0.25rem
  md: 0.5rem
  lg: 0.75rem
components:
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
  project-label:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
  text-selection:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.small}"
    rounded: "{rounded.md}"
    height: "{spacing.space-8}"
  button-outline-hover:
    backgroundColor: "{colors.surface-hover}"
  button-blue:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
    typography: "{typography.small}"
    rounded: "{rounded.md}"
    height: "{spacing.space-8}"
  button-blue-hover:
    backgroundColor: "{colors.accent-hover}"
---

# Website design

## Overview

The site introduces Sven, presents selected work, and makes contact easy. A
single reading column, quiet interface chrome, and generous separation give
project imagery room to lead. Keep the interface precise and product-like;
project media can carry unrestricted color and visual variety.

Use this guide when extending or reviewing the site. It records the current
design for human contributors and coding agents, with exact values in YAML and
usage guidance below. [AGENTS.md](AGENTS.md) covers contribution rules.
[global.css](src/styles/global.css) and [tokens.css](src/styles/tokens.css) define
the implemented design values; component styles define local behavior.

## Colors

The site is dark-only (`color-scheme: dark`), with zinc neutrals and a restrained
blue accent. Use semantic utilities such as `bg-background`, `text-foreground`,
and `border-border`, or the corresponding CSS variables. The `.semantic-tokens`
class on `<html>` supplies additional roles. In YAML, `primary` represents the
existing CSS `accent` role; it is not an additional interface color.

| Role (`--color-*`)          | Current value                | Use                                     |
| --------------------------- | ---------------------------- | --------------------------------------- |
| `background`                | Tailwind zinc-950            | Page canvas                             |
| `foreground`                | zinc-50                      | Primary text and icons                  |
| `muted-foreground`          | zinc-400                     | Supporting text, project labels, footer |
| `surface` / `surface-hover` | zinc-900 / zinc-800          | Controls, contact card, media backing   |
| `accent` / `accent-hover`   | blue-600 / blue-500          | Primary email action and hover          |
| `accent-foreground`         | blue-50                      | Selected text foreground                |
| `border`                    | White at 12%, mixed in OKLab | Control, card, and media borders        |

Text selection uses `accent` with `accent-foreground`; blue buttons currently
use `foreground` for their text. `link` (blue-400) and `border-subtle` (white at
7%) are defined but not currently applied. Body links inherit text color and
use a muted underline that turns accent blue on hover; do not infer that all
links should be blue from the available token.

## Typography

Self-hosted **Inter Variable** is the default; **Geist Mono Variable** is used
for the footer repository identifier. Both use `font-display: swap`. Reuse the
type classes rather than approximating their sizes or weights.

YAML typography names map to `.type-*` classes, except `body`, which is the
body default. Display and heading text balance wrapping; label and mono styles
are uppercase. Project headings use the muted label style, the contact heading
uses `type-heading`, and legal/404 titles use `type-display`.
The homepage introduction is body text, not a large display headline.

## Layout

Reuse `.page-shell`: a centered, fluid column with a maximum content width of
42rem (672px), plus 20px gutters below 48rem and 32px gutters from 48rem.
There is no desktop multicolumn project grid. The introduction paragraph is
further limited to 29rem.

Spacing derives from Tailwind's 0.25rem base. Semantic `--space-*` tokens cover
1, 2, 3, 4, 6, 8, 12, 16, 24, and 32 multiples. Existing rhythm:

- Major homepage sections and layout children: `--space-24` (96px).
- Page top/bottom padding: 96px, reduced to `--space-12` (48px) below 48rem.
- Intro logo-to-copy and legal page groups: `--space-8` (32px).
- Work prose/media groups: `--space-6` (24px); label-to-content and stacked
  media: `--space-4` (16px).
- Compact controls and icon/text pairs: `--space-2` (8px).

Section gaps stay generous on mobile. Contact padding drops from 32px to 24px;
intro actions and footer rows wrap. Media fills the column. Preserve this reflow
and readable type instead of shrinking the whole interface for narrow screens.

## Elevation & Depth

Hierarchy comes from spacing, typography, surface contrast, and 1px borders.
The current interface has no decorative shadows. Media has an inset border
overlay with `pointer-events: none`; it must not intercept interaction.

## Shapes

Use the existing radius tokens: `sm` (4px) for small link outlines, `md` (8px)
for buttons, and `lg` (12px) for media and the contact card. `--radius-full` is
available but does not establish a pill-based component style.

## Components

- [Button](components/button.tsx): reuse `Button` for Base UI button behavior
  and `buttonClass()` for styled native links. Default `outline` uses a bordered
  surface; `blue` is the primary variant. Both are 32px high with 8px horizontal
  padding; icon size has a 32px minimum width. Disabled buttons dim to 50%.
- [WorkMedia](components/work-media.astro): reuse for responsive images and
  looping, muted project videos. Media keeps natural proportions unless framed;
  explicit aspect ratios crop with `object-fit: cover`. Supply descriptive alt
  text, dimensions, and video posters. See the
  [video workflow](docs/video-workflow.md) for asset preparation.
- [Header](components/site-header.astro) and
  [footer](components/site-footer.astro): retain the compact 32px logo and shared
  footer. The homepage footer adds a bordered contact card with a three-column
  social row; legal pages use the simpler footer.
- Use Lucide for interface icons. Existing social brand marks use
  [SocialIcon](components/social-icon.astro) SVG masks in `currentColor`, at
  14px or 24px. Preserve that distinction.

Keep page structure and content in Astro/MDX. Static links can share React button
styling without hydration; hydrate only behavior that needs it.

### Interaction and accessibility

Hover changes surface, text, or underline color. Buttons also scale to 0.98 and
darken to 0.8 brightness while pressed. Default transitions use 200ms and
`--ease-standard`; press feedback uses 120ms. Other duration/easing tokens are
available, not a requirement to introduce more animation.

Preserve the focus-visible foreground outline (2px), the skip-to-content link,
landmarks, heading relationships, accessible names on icon-only links, and
hidden decorative icons. Contact card focus outlines are inset to avoid clipping.
Use native links for navigation and Base UI for interactive primitives.

Reduced motion disables smooth scrolling, minimizes CSS transitions/animations,
and removes button press scaling. Project videos play only while visible and
the document is active; reduced motion prevents playback and keeps posters.
Poster images also provide the no-JavaScript fallback. Preserve these behaviors.

## Do's and Don'ts

- Reuse semantic tokens, type roles, and shared components before adding values.
- Keep project imagery expressive and surrounding interface colors restrained.
- Preserve keyboard focus and readable content without JavaScript or motion.
- Do not treat unused tokens as evidence of an established component pattern.
- Do not invent light mode, additional component variants, or new layout systems
  as part of routine changes.
