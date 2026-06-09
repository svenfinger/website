import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(200),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    cover: z.url().optional(),
    coverAlt: z.string().optional(),

    featured: z.boolean().default(false),
    order: z.number().optional(),
    draft: z.boolean().default(false),

    role: z.string().optional(),
    client: z.string().optional(),
    year: z.number().int().optional(),
    links: z
      .object({
        live: z.url().optional(),
        repo: z.url().optional(),
      })
      .optional(),
  }),
});

export const collections = { work };
