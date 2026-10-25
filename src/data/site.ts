// Настройки сайта. Адрес и база берутся из astro.config.mjs (site, base).
// Значения правятся в админке («Настройки сайта») и лежат в src/content/site/index.json
import site from '../content/site/index.json';

const social = (url: string) => (url || '').trim();

export const SITE = {
  name: site.name,
  lang: 'ru',
  locale: 'ru_RU',
  title: site.title,
  description: site.description,
  email: site.email,
  author: { name: site.authorName, path: 'about/' },
  footerText: site.footerText,
  socials: {
    telegram: social(site.telegram),
    youtube: social(site.youtube),
    instagram: social(site.instagram),
    tiktok: social(site.tiktok),
  },
  // Пока сайт собирается, он закрыт от индексации: noindex на страницах и Disallow в robots.txt.
  // Перед запуском соберите с INDEXABLE=true (переменная окружения).
  indexable: process.env.INDEXABLE === 'true',
};

export const PER_PAGE = 8;

// Разделы меню (slug для адреса, name для показа)
export const SECTIONS = [
  { slug: 'novosti', name: 'новости' },
  { slug: 'stati', name: 'статьи' },
  { slug: 'obzory', name: 'обзоры' },
  { slug: 'dizajn', name: 'дизайн' },
  { slug: 'lajfhaki', name: 'лайфхаки' },
  { slug: 'kino', name: 'кино' },
  { slug: 'igry', name: 'игры' },
  { slug: 'avto', name: 'авто' },
] as const;

// Итоги недели: неделя с понедельника (время редакции +03:00)
export const DIGESTS = [
  { slug: '2026-43', from: new Date('2026-10-19T00:00:00+03:00'), to: new Date('2026-10-25T23:59:59+03:00') },
];
