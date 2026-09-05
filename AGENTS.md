# Project Instructions

This repository contains a personal portfolio designed as a product-like web interface.

## Working Style

- Keep changes focused on the requested task.
- Do not add features, abstractions, dependencies, or refactors that were not requested.
- Ask before introducing a new dependency or changing an architectural decision.
- Prefer the simplest implementation that satisfies the current requirement.
- Do not commit, tag, push, or open a pull request unless explicitly asked.
- Do not modify unrelated files.

## Stack

- Astro with static output
- React for interactive UI only
- Tailwind CSS 4
- shadcn/ui using Base UI
- Lucide icons
- Geist typography
- Astro Content Collections and MDX
- pnpm
- Cloudflare Workers Static Assets

## Architecture

- Prefer Astro for pages, layouts, content, and non-interactive components.
- Use React only where client-side interaction or a shadcn component requires it.
- Keep React islands as small as practical; do not convert static content to React without a reason.
- Keep the site statically generated unless a feature explicitly requires server-side behavior.
- Do not add global state management unless a concrete requirement needs it.

## UI

- Use existing shadcn components before creating equivalent primitives.
- Do not hand-roll accessible primitives already provided by Base UI/shadcn.
- Use semantic theme tokens instead of arbitrary interface colors.
- Keep the interface restrained, precise, and product-like.
- Prefer borders and surfaces over decorative shadows.
- Use blue sparingly as the primary interface accent.
- Project imagery may use unrestricted color.
- Use Lucide for interface icons.
- Do not use Inter or Phosphor.
- Preserve visible keyboard focus and native accessibility behavior.
- Respect prefers-reduced-motion for non-essential motion.

## Quality

- Follow the existing code style and patterns.
- Avoid premature abstraction.
- Remove temporary prototype/test code after it has served its purpose.
- Run the relevant existing checks and `pnpm build` after implementation.
- Never claim a check passed unless it was actually run successfully.

## Git

- Keep commit messages concise, ideally 3–5 words.
- Describe the primary change only; don't enumerate implementation details.
- Prefer simple imperative messages such as:
  - `Add project instructions`
  - `Add button component`
  - `Update work page`
  - `Fix mobile navigation`
- Avoid long commit bodies unless explicitly requested.

