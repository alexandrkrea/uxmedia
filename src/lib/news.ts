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

export const feedOf = (items: News[]) => items.filter(n => !n.data.promo);

// Лента: закреплённая новость (если выбрана в админке на «Главной») идёт первой, остальные по дате
export async function feed() {
  const items = feedOf(await allNews());
  const i = home.pinned ? items.findIndex(n => n.id === home.pinned) : -1;
  return i > 0 ? [items[i], ...items.slice(0, i), ...items.slice(i + 1)] : items;
}
export async function promo() { return (await allNews()).find(n => n.data.promo)!; }
export const totalPages = (feedItems: News[]) => Math.ceil(feedItems.length / PER_PAGE);

export async function allTags() { return getCollection('tags'); }

export const byTag = (items: News[], tag: string) => items.filter(n => n.data.tags.some(t => t.id === tag));
export const bySection = (items: News[], name: string) => items.filter(n => n.data.section === name);
export const sectionSlug = (name: string) => (SECTIONS.find(s => s.name === name) ?? SECTIONS[0]).slug;

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
