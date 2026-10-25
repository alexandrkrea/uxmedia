// Пагинация. Ссылки настоящие (каждая страница есть как отдельный адрес), а скрипт только улучшает:
// скелетон → прокрутка до первой новости → подстановка новой страницы без перезагрузки.

import { $, $$, waitForScroll } from './util.js';
import { applyQuality, watchPhs } from './images.js';

const feed = $('.feed');
const KINDS = ['light', 'wide', 'wide', 'light', 'wide', 'wide', 'light', 'wide'];
let token = 0;

// ——— Скелетон ———
const lines = '<span class="skel-line" style="width:90%;height:24px"></span><span class="skel-line" style="width:60%;height:24px"></span><span class="skel-line" style="width:100%"></span><span class="skel-line" style="width:75%"></span><span class="skel-line" style="width:30%;height:13px"></span>';
const skeleton = kind => (kind === 'light'
  ? `<article class="card card--light is-skeleton" aria-hidden="true"><div class="ph card__img"></div><div class="card__body">${lines}</div></article>`
  : `<article class="card card--photo card--wide is-skeleton" aria-hidden="true"><div class="ph card__bg"></div><div class="skel-text">${lines}</div></article>`);

function showSkeleton(count) {
  $$('.card', feed).forEach(c => c.remove());
  const html = Array.from({ length: count }, (_, i) => skeleton(KINDS[i % KINDS.length])).join('');
  $('.pager-block', feed).insertAdjacentHTML('beforebegin', html);
}

// ——— Ряд номеров: прячем кнопки, которые не влезают рядом со списком, текущая страница остаётся ———
function fitPages() {
  const pages = $('.pages');
  if (!pages) return;
  const items = $$('li', pages);
  items.forEach(li => { li.style.display = ''; });
  const pager = pages.parentElement;
  const free = pager.clientWidth - $('.dropdown', pager).offsetWidth - 8;
  let first = 0, last = items.length - 1;
  const width = () => items.slice(first, last + 1).reduce((w, li) => w + li.offsetWidth, 0) + 8 * (last - first);
  const cur = items.findIndex(li => $('[aria-current]', li));
  while (last > first && width() > free) {
    if (last > cur) last--; else first++;
  }
  items.forEach((li, i) => { li.style.display = i < first || i > last ? 'none' : ''; });
}

// ——— Выпадающий список страниц ———
function initDropdown() {
  const dropdown = $('.dropdown');
  if (!dropdown) return;
  const button = $('.pg--total', dropdown);
  const panel = $('.dropdown__panel', dropdown);
  const toggle = open => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    dropdown.classList.toggle('is-open', open);
    if (open) {
      const cur = $('.is-current', panel);
      if (cur) panel.scrollTop = cur.offsetTop - panel.clientHeight / 2 + cur.offsetHeight / 2;
    }
  };
  button.addEventListener('click', () => toggle(panel.hidden));
  document.addEventListener('click', e => { if (!dropdown.contains(e.target)) toggle(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); button.focus(); } });
}

function initPager() {
  fitPages();
  initDropdown();
  const pager = $('.pager-block .pager');
  if (pager) new ResizeObserver(fitPages).observe(pager);
}

// ——— Переход на страницу ———
async function go(url, push) {
  const my = ++token;
  const request = fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  const target = Math.max(0, Math.round(feed.getBoundingClientRect().top + window.scrollY - 24));
  window.scrollTo({ top: target, behavior: 'smooth' });
  try {
    const doc = new DOMParser().parseFromString(await request, 'text/html');
    if (my !== token) return;
    showSkeleton($$('.feed .card', doc).length);
    await waitForScroll(target);
    if (my !== token) return;

    feed.innerHTML = $('.feed', doc).innerHTML;
    $('.aside').innerHTML = $('.aside', doc).innerHTML;
    document.title = doc.title;
    $('meta[name="description"]').content = $('meta[name="description"]', doc).content;
    $('link[rel="canonical"]').href = $('link[rel="canonical"]', doc).href;
    if (push) history.pushState({}, '', url);
    applyQuality(); // учитываем режим молнии у новых карточек
    watchPhs(); // и карточки ленты, и баннер справа
    initPager();
  } catch {
    location.href = url; // что-то пошло не так: обычный переход
  }
}

document.addEventListener('click', e => {
  const link = e.target.closest('.pager-block a[href]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  if (link.href !== location.href) go(link.href, true);
});
window.addEventListener('popstate', () => go(location.href, false));

initPager();
