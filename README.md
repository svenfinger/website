# Portfolio

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

## Content

Add an MDX file to `src/content/work/` with a `title`, `year`, and `order`.
Entries render on the homepage; they do not create separate project routes.
Use `WorkMedia` for images and videos, and `work-media-stack` to group media.

The footer links to the Git commit present at build time. If Git metadata is
unavailable, it links to the repository without showing a revision.

Videos are served from R2 through `media.svenfinger.com`. Full-quality masters
and generated delivery files stay in the ignored `video-masters/` and
`video-output/` folders. Only current site assets belong in `public/`.

The contact card appears only on the homepage. Privacy and Imprint retain their
content and share the compact footer links.
