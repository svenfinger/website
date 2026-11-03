# Website

Source for [svenfinger.com](https://svenfinger.com), my personal portfolio website.
A compact homepage with selected work, contact links, and legal pages.

## Stack

- **Astro** for static pages and layouts, with **React** for interactive UI.
- **Tailwind CSS 4** with semantic theme tokens, **Base UI** primitives,
  **Lucide** icons, and self-hosted **Inter Variable / Geist Mono** typography.
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

## Agent access

Pages are available as HTML without JavaScript and as Markdown through content
negotiation. Both formats share the same content and URLs. Request Markdown with
an `Accept: text/markdown` header:

```sh
curl -sS -L -H 'Accept: text/markdown' https://svenfinger.com/
```

Browsers receive HTML by default. Negotiated responses include `Vary: Accept`.
The [OpenAPI description](https://svenfinger.com/openapi.json) documents the
read-only page endpoints and supported response formats. Clients requesting
JSON receive structured error responses using RFC 9457 Problem Details.

## Docs

[Video workflow](docs/video-workflow.md) — preparing and updating project videos.
