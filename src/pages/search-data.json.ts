import { getImage } from 'astro:assets';
import { SECTIONS, DIGESTS } from '../data/site';
import { allNews, allTags } from '../lib/news';
import { dateLabel } from '../lib/format';
import { route, href } from '../lib/url';

// Данные для поиска: скрипт подгружает их при первом открытии окна поиска
export async function GET() {
  const [news, tags] = await Promise.all([allNews(), allTags()]);
  const data = {
    news: await Promise.all(news.map(async n => ({
      title: n.data.title,
      lead: n.data.lead,
      url: href(route.article(n.id)),
      thumb: (await getImage({ src: n.data.image, width: 256, format: 'webp', quality: 40 })).src,
      dateLabel: dateLabel(n.data.date),
    }))),
    sections: SECTIONS.map(s => ({ title: s.name, url: href(route.section(s.slug)) })),
    links: [
      { title: 'контакты', url: href(route.about + '#contacts') },
      { title: 'реклама', url: href(route.about + '#advertising') },
      { title: 'о проекте', url: href(route.about) },
      { title: 'предложить новость', url: href(route.about + '#suggest') },
      ...DIGESTS.map(d => ({ title: 'итоги недели', url: href(route.digest(d.slug)) })),
      ...tags.map(t => ({ title: t.data.name, url: href(route.tag(t.id)) })),
    ],
  };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
