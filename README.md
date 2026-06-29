# Website

Personal portfolio built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [MDX](https://mdxjs.com). Deployed to [Cloudflare Pages](https://pages.cloudflare.com).

## Requirements

- Node.js >= 22.12
- [pnpm](https://pnpm.io)

## Development

```sh
pnpm install
pnpm dev
```

Open [localhost:4321](http://localhost:4321).

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Start the dev server                     |
| `pnpm build`        | Build for production                     |
| `pnpm preview`      | Preview the production build locally      |
| `pnpm format`       | Format all files with Prettier           |
| `pnpm format:check` | Check formatting without writing changes |

## Project structure

```text
src/
├── components/   # Header, Footer
├── content/      # MDX content (work portfolio)
├── layouts/      # Page layouts
├── pages/        # Routes (/, /work, /now)
└── styles/       # Global styles, design tokens, typography
```

## Design system

Colors and typography are defined in the [Figma Design System](https://www.figma.com/design/2PxfGXZvWP48L7RtfkD5ff/Design-System) and mirrored into CSS:

- **Colors** — the Figma _Semantics_ variable collection (Light/Dark modes) lives in `src/styles/tokens.css` as semantic CSS variables and Tailwind `--color-*` utilities (e.g. `bg-background-primary`, `text-foreground-secondary`). Primitive colors are Tailwind's defaults.
- **Typography** — the Figma _Semantics_ text styles live in `src/styles/typography.css` as utility classes (e.g. `text-headline-large`, `text-body-medium`). Primitive ramps (`text-xs` → `text-9xl`) are Tailwind's defaults.

These files are kept in sync **manually via Cursor + the Figma MCP** (no Enterprise Variables REST API access). When the design system changes in Figma, ask the agent to re-sync — the full procedure lives in [`AGENTS.md`](./AGENTS.md). Don't hand-edit the values in those two files.

## Deployment

The site is a static build deployed via Cloudflare Pages. Connect the GitHub repo and use:

| Setting                | Value        |
| ---------------------- | ------------ |
| Framework preset       | Astro        |
| Build command          | `pnpm build` |
| Build output directory | `dist`       |
| Production branch      | `main`       |

Preview deploys run on pushes to `staging`. Production deploys run on merges to `main`.

`wrangler` is kept as a dev dependency for future R2 media uploads (Phase 4).
