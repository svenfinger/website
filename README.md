# Portfolio

Source for [svenfinger.com](https://svenfinger.com), my personal portfolio website.
A minimal, product-like interface for selected work and projects.

## Stack

- **Astro** for static pages and layouts, with **React** for interactive UI.
- **Tailwind CSS 4** with semantic theme tokens, **Base UI** primitives,
  **Lucide** icons, and **Google Sans Flex** typography.
- **Astro Content Collections + MDX** for case studies.
- **Cloudflare Workers Static Assets** for hosting the generated site.

## Structure

- `src/pages/` — routes and page templates.
- `src/content/work/` — case studies.
- `components/` — shared Astro and React components.
- `src/styles/` — theme tokens and global styles.

## Development

Install dependencies and start the local server with pnpm:

```sh
pnpm install
pnpm dev
```

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `pnpm build`        | Generate the site in `dist/` |
| `pnpm preview`      | Preview the production build |
| `pnpm lint`         | Run ESLint                   |
| `pnpm format:check` | Check formatting             |
