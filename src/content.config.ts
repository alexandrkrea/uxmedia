// Коллекции контента. Те же поля редактирует админка Keystatic (keystatic.config.ts).
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const SECTION_NAMES = ['новости', 'статьи', 'обзоры', 'дизайн', 'лайфхаки', 'кино', 'игры', 'авто'] as const;

const tags = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tags' }),
  schema: z.object({
    name: z.string(),
    desc: z.string(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lead: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      section: z.enum(SECTION_NAMES),
      tags: z.array(reference('tags')).default([]),
      image: image(),
      summary: z.array(z.string()).min(1).max(5),
      promo: z.boolean().default(false), // карточка в правой колонке, в ленту не попадает
      draft: z.boolean().default(false), // черновик: на сайт не попадает
    }),
});

export const collections = { news, tags };
