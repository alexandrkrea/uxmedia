// Настройки Astro. Сайт статический (output: 'static'); админка Keystatic подключается только в режиме разработки.
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

const isDev = process.argv.includes('dev');

export default defineConfig({
  // Боевой адрес: canonical, Open Graph, sitemap. Переопределяется переменной SITE_URL при сборке.
  site: process.env.SITE_URL || 'https://uxm.by',
  // Для тестового стенда на GitHub Pages workflow ставит BASE_PATH=/<имя-репозитория>/
  base: process.env.BASE_PATH || '/',
  // Админке Keystatic нужны адреса API без косой черты, поэтому в разработке слэш не обязателен
  trailingSlash: isDev ? 'ignore' : 'always',
  integrations: [
    mdx(),
    sitemap({ filter: page => !page.includes('/404') }),
    ...(isDev ? [react(), keystatic()] : []),
  ],
});
