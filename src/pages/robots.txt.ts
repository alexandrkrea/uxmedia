import type { APIContext } from 'astro';
import { SITE } from '../data/site';

// Пока сайт собирается, он закрыт для всех роботов. Открывается при сборке с INDEXABLE=true.
export function GET({ site }: APIContext) {
  const body = SITE.indexable
    ? `# Боевой режим: сайт открыт для индексации
User-agent: *
Allow: /

# ИИ-краулеры: решение принимает редакция. Чтобы закрыть, раскомментируйте нужные строки.
# User-agent: GPTBot
# Disallow: /
# User-agent: PerplexityBot
# Disallow: /
# User-agent: CCBot
# Disallow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}
`
    : `# Сайт собирается и закрыт для всех роботов до запуска.
# Когда всё заработает: соберите с INDEXABLE=true — файл станет «открытым».
User-agent: *
Disallow: /
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
