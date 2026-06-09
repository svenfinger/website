# Website

Personal site built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com), and [MDX](https://mdxjs.com). Deployed to [Cloudflare Workers](https://workers.cloudflare.com).

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

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Build for production (generates design tokens first) |
| `pnpm preview` | Preview the production build locally |
| `pnpm generate-tokens` | Regenerate `src/styles/tokens.css` from `src/tokens/` |

## Project structure

```text
src/
├── components/   # Header, Footer, ThemeToggle
├── content/      # MDX content (work portfolio)
├── layouts/      # Page layouts
├── pages/        # Routes (/, /work, /now)
├── styles/       # Global styles and generated tokens
└── tokens/       # Design token source (JSON)
```

## Deployment

The site uses the Cloudflare adapter. Build with `pnpm build`, then deploy with Wrangler:

```sh
pnpm wrangler deploy
```
