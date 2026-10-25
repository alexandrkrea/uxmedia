import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../data/site';
import { allNews } from '../lib/news';
import { route, href } from '../lib/url';

export async function GET(context: APIContext) {
  const items = await allNews();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    customData: `<language>${SITE.lang}</language>`,
    items: items.map(n => ({
      title: n.data.title,
      description: n.data.lead,
      pubDate: n.data.date,
      link: href(route.article(n.id)),
      categories: n.data.tags.map(t => t.id),
    })),
  });
}
