// Выборки новостей и тегов. Здесь же собираются списки для лент, тегов, разделов и итогов недели.

import { getCollection, type CollectionEntry } from 'astro:content';
import { SECTIONS, PER_PAGE } from '../data/site';
import home from '../content/home/index.json';

export type News = CollectionEntry<'news'>;

// Все опубликованные новости, свежие первыми
export async function allNews(): Promise<News[]> {
  const items = await getCollection('news', n => !n.data.draft);
  return items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const promoNews = (items: News[]) => items.find(n => n.data.promo);

// Баннеры справа на главной и страницах без статьи (настраиваются на «Главной» в админке):
// выбранные новости (можно несколько), если не выбраны, то новость с галочкой «Баннер по умолчанию»; можно отключить совсем
export async function homeBanners(): Promise<News[]> {
  if (home.showBanner === false) return [];
  const items = await allNews();
  const picked = (home.banners ?? []).map(id => items.find(n => n.id === id)).filter((n): n is News => !!n);
  if (picked.length) return picked;
  const fallback = promoNews(items);
  return fallback ? [fallback] : [];
}

// Лента: без новостей, которые показаны баннером; закреплённая (если выбрана на «Главной») идёт первой, остальные по дате
export async function feed() {
  const banners = (await homeBanners()).map(n => n.id);
  const items = (await allNews()).filter(n => !banners.includes(n.id));
  const i = home.pinned ? items.findIndex(n => n.id === home.pinned) : -1;
  return i > 0 ? [items[i], ...items.slice(0, i), ...items.slice(i + 1)] : items;
}
export async function promo() { return promoNews(await allNews()); } // может не быть: баннер по умолчанию не обязателен
export const totalPages = (feedItems: News[]) => Math.ceil(feedItems.length / PER_PAGE);

export async function allTags() { return getCollection('tags'); }

export const byTag = (items: News[], tag: string) => items.filter(n => n.data.tags.some(t => t.id === tag));
export const bySection = (items: News[], name: string) => items.filter(n => n.data.section === name);
export const sectionSlug = (name: string) => (SECTIONS.find(s => s.name === name) ?? SECTIONS[0]).slug;

// Баннер справа, когда у статьи он не выбран вручную: самая подходящая новость.
// Очки: общие теги (по 3) и тот же раздел (2), при равенстве свежая выше. Саму статью и уже показанные
// на странице материалы («Читайте также») не берём. Если подходящих нет, остаётся баннер по умолчанию.
export function autoBanner(items: News[], n: News, exclude: string[] = []): News | undefined {
  const mine = n.data.tags.map(t => t.id);
  return items
    .filter(m => m.id !== n.id && !exclude.includes(m.id))
    .map(m => ({ m, score: m.data.tags.filter(t => mine.includes(t.id)).length * 3 + (m.data.section === n.data.section ? 2 : 0) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.m.data.date.getTime() - a.m.data.date.getTime())[0]?.m;
}

// Похожие материалы: по числу общих тегов, затем по дате
export function related(items: News[], n: News, limit = 2): News[] {
  const mine = n.data.tags.map(t => t.id);
  return items
    .filter(m => m.id !== n.id)
    .map(m => ({ m, score: m.data.tags.filter(t => mine.includes(t.id)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || b.m.data.date.getTime() - a.m.data.date.getTime())
    .slice(0, limit)
    .map(x => x.m);
}
