# Website

Source for [svenfinger.com](https://svenfinger.com), my personal portfolio website.
A compact homepage with selected work, contact links, and legal pages.

## Stack

- **Astro** for static pages and layouts, with **React** for interactive UI.
- **Tailwind CSS 4** with semantic theme tokens, **Base UI** primitives,
  **Lucide** icons, and self-hosted **Google Sans Flex / Google Sans Code** typography.
- **Astro Content Collections + MDX** for homepage work entries.
- **Cloudflare Workers Static Assets** for hosting the generated site.

## Structure

- `src/pages/` — routes and page templates.
- `src/content/work/` — homepage entries, sorted by frontmatter `order`.
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

## Docs

[Video workflow](docs/video-workflow.md) — preparing and updating project videos.
