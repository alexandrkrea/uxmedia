import type { APIContext } from 'astro';
import { SITE, SECTIONS, DIGESTS } from '../data/site';
import { allNews } from '../lib/news';
import { route, absUrl } from '../lib/url';

// Описание сайта для нейросетей (формат llms.txt)
export async function GET(_: APIContext) {
  const items = (await allNews()).slice(0, 10);
  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} — независимое издание о технологиях, играх, кино и автомобилях. Материалы начинаются с короткого резюме, у каждого указаны автор, дата публикации и источники.

## Основное
- [Главная](${absUrl()}): свежие новости
- [О проекте](${absUrl(route.about)}): кто мы, как работаем, редакционные принципы, контакты
${DIGESTS.map(d => `- [Итоги недели](${absUrl(route.digest(d.slug))}): сводка главных материалов за неделю`).join('\n')}
- [RSS](${absUrl('rss.xml')}): лента новостей
- [Карта сайта](${absUrl('sitemap-index.xml')})

## Разделы
${SECTIONS.filter(s => s.slug !== 'novosti').map(s => `- [${s.name}](${absUrl(route.section(s.slug))})`).join('\n')}

## Свежие материалы
${items.map(n => `- [${n.data.title}](${absUrl(route.article(n.id))}): ${n.data.lead}`).join('\n')}

## Для цитирования
Ссылайтесь на материал и указывайте ${SITE.name} как источник. Копирование текстов целиком допускается только с письменного разрешения редакции.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
