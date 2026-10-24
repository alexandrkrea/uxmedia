// Автотесты собранного сайта (папка dist). Запуск: npm test (сначала собирает сайт).
// Проверяют то, что ломается незаметно: битые ссылки и картинки, заголовки, метаданные, разметку для поиска.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
// На тестовом стенде сайт живёт в подпапке (BASE_PATH=/имя-репозитория/): отрезаем её от адресов
const BASE = process.env.BASE_PATH || '/';
const local = u => (u.startsWith(BASE) ? '/' + u.slice(BASE.length) : u);

async function htmlFiles(dir = DIST) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...await htmlFiles(p));
    else if (e.name.endsWith('.html')) files.push(p);
  }
  return files;
}
const exists = p => stat(p).then(() => true, () => false);
const pages = await Promise.all((await htmlFiles()).map(async f => ({ file: relative(DIST, f).replaceAll('\\', '/'), html: await readFile(f, 'utf8') })));
const jsonLd = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));

test('страницы собраны', () => assert.ok(pages.length >= 40, `страниц: ${pages.length}`));

test('у каждой страницы один h1, title, description и canonical', () => {
  for (const { file, html } of pages) {
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${file}: ровно один h1`);
    assert.match(html, /<title>[^<]{10,}<\/title>/, `${file}: title`);
    assert.match(html, /<meta name="description" content="[^"]{20,}"/, `${file}: description`);
    assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+"/, `${file}: canonical`);
  }
});

test('заголовки title не повторяются', () => {
  const seen = new Map();
  for (const { file, html } of pages) {
    const t = html.match(/<title>([^<]*)<\/title>/)[1];
    assert.ok(!seen.has(t), `${file} и ${seen.get(t)} с одинаковым title: ${t}`);
    seen.set(t, file);
  }
});

test('внутренние ссылки и картинки ведут на существующие файлы', async () => {
  for (const { file, html } of pages) {
    const dir = dirname(join(DIST, file));
    const refs = [...html.matchAll(/(?:href|src|srcset)="([^"#?]+)(?:[#?][^"]*)?"/g)].map(m => m[1])
      .filter(u => !/^(https?:|mailto:|data:|\/\/)/.test(u) && u !== '');
    for (const ref of refs) {
      const target = ref.startsWith('/') ? join(DIST, local(ref)) : resolve(dir, ref);
      if (!(await exists(target))) assert.fail(`${file}: нет файла для «${ref}»`);
      if ((await stat(target)).isDirectory()) assert.ok(await exists(join(target, 'index.html')), `${file}: у папки «${ref}» нет index.html`);
    }
  }
});

test('у всех картинок есть alt и размеры', () => {
  for (const { file, html } of pages) {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(tag, /\salt="/, `${file}: img без alt: ${tag.slice(0, 80)}`);
      assert.match(tag, /\swidth="\d+"/, `${file}: img без width: ${tag.slice(0, 80)}`);
    }
  }
});

test('JSON-LD валиден, на статьях есть NewsArticle и крошки', () => {
  for (const { file, html } of pages) {
    const blocks = jsonLd(html);
    if (/^news\/(?!page)/.test(file)) {
      const types = blocks.flatMap(b => b['@graph'].map(x => x['@type']));
      assert.ok(types.includes('NewsArticle') && types.includes('BreadcrumbList'), `${file}: ${types}`);
    }
  }
});

test('крошки на странице совпадают с разметкой BreadcrumbList', () => {
  for (const { file, html } of pages) {
    const visible = (html.match(/<nav class="crumbs"[\s\S]*?<\/nav>/) || [''])[0].match(/<li>/g)?.length || 0;
    const ld = jsonLd(html).flatMap(b => b['@graph']).find(x => x['@type'] === 'BreadcrumbList');
    assert.equal(ld ? ld.itemListElement.length : 0, visible, `${file}: крошек на странице ${visible}`);
  }
});

test('в sitemap только существующие страницы', async () => {
  const index = await readFile(join(DIST, 'sitemap-index.xml'), 'utf8');
  assert.match(index, /sitemap-0\.xml/);
  const sitemap = await readFile(join(DIST, 'sitemap-0.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.ok(locs.length > 20);
  for (const loc of locs) {
    const path = local(new URL(loc).pathname).slice(1);
    assert.ok(await exists(join(DIST, path, 'index.html')), `sitemap: нет страницы ${loc}`);
  }
  assert.ok(!sitemap.includes('/404'));
});

test('robots.txt, rss.xml, llms.txt и данные поиска на месте', async () => {
  for (const f of ['robots.txt', 'rss.xml', 'llms.txt', 'search-data.json']) assert.ok(await exists(join(DIST, f)), f);
  assert.match(await readFile(join(DIST, 'llms.txt'), 'utf8'), /^# UXM\.BY/);
  const data = JSON.parse(await readFile(join(DIST, 'search-data.json'), 'utf8'));
  assert.ok(data.news.length >= 10 && data.sections.length === 8);
});

test('пока сайт закрыт, роботы закрыты и на каждой странице стоит noindex', async () => {
  const robots = await readFile(join(DIST, 'robots.txt'), 'utf8');
  if (!/Disallow: \/\s*$/m.test(robots)) return; // боевой режим (INDEXABLE=true): проверка не нужна
  for (const { file, html } of pages) assert.match(html, /<meta name="robots" content="noindex/, file);
});

test('картинки в ленте: обычный <picture>, avif и webp, у первой приоритет', () => {
  const home = pages.find(p => p.file === 'index.html').html;
  assert.ok((home.match(/<picture/g) || []).length >= 8);
  assert.match(home, /type="image\/avif"/);
  assert.match(home, /fetchpriority="high"/);
});
