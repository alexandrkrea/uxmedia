// Поиск в стиле Spotlight: новости и разделы меню. Данные (search-data.json) подгружаются при первом открытии.

import { $, $$, lockBackground } from './util.js';

const dialog = $('#search');
const input = $('#search-input');
const list = $('#search-list');
const phone = window.matchMedia('(max-width: 640px)');

const setPlaceholder = () => { input.placeholder = phone.matches ? 'Поиск' : 'Поиск по новостям и разделам'; };
setPlaceholder();
phone.addEventListener('change', setPlaceholder);

const escHtml = t => t.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const escRe = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function mark(text, q) {
  const safe = escHtml(text);
  return q ? safe.replace(new RegExp('(' + escRe(escHtml(q)) + ')', 'gi'), '<mark>$1</mark>') : safe;
}

let data = null;
async function load() {
  if (!data) data = await fetch(import.meta.env.BASE_URL + 'search-data.json').then(r => r.json());
  return data;
}

let items = [];
let active = 0;
let unlock = null;

function render() {
  if (!data) return;
  const raw = input.value.trim();
  const q = raw.toLowerCase();
  // основные разделы показываем сразу, остальные страницы находятся только через поиск
  const pages = q ? [...data.sections, ...data.links].filter(s => s.title.includes(q)) : data.sections;
  const news = data.news.filter(n => !q || n.title.toLowerCase().includes(q) || n.lead.toLowerCase().includes(q)).slice(0, q ? 20 : 4);
  items = [];
  let html = '';
  if (pages.length) {
    html += '<div class="search__group" role="presentation">Разделы</div>';
    pages.forEach(s => {
      html += `<a href="${s.url}" class="search__item" role="option" data-i="${items.length}"><span class="search__text"><span class="search__title">${mark(s.title, raw)}</span></span></a>`;
      items.push(s);
    });
  }
  if (news.length) {
    html += '<div class="search__group" role="presentation">Новости</div>';
    news.forEach(n => {
      html += `<a href="${n.url}" class="search__item search__item--news" role="option" data-i="${items.length}"><span class="search__thumb" style="background-image:url(${n.thumb})"></span><span class="search__text"><span class="search__title">${mark(n.title, raw)}</span><span class="search__sub">${escHtml(n.dateLabel)}</span></span></a>`;
      items.push(n);
    });
  }
  list.innerHTML = html || '<div class="search__empty">Ничего не найдено</div>';
  active = 0;
  markActive();
}

function markActive() {
  $$('.search__item', list).forEach(el => {
    const on = +el.dataset.i === active;
    el.classList.toggle('is-active', on);
    el.setAttribute('aria-selected', String(on));
    if (on) el.scrollIntoView({ block: 'nearest' });
  });
}

async function open() {
  if (!dialog.hidden) return;
  unlock = lockBackground([$('.page')]);
  dialog.hidden = false;
  document.body.classList.add('search-open');
  input.value = '';
  input.focus();
  await load();
  render();
}

function close() {
  if (dialog.hidden) return;
  dialog.hidden = true;
  document.body.classList.remove('search-open');
  unlock?.();
  unlock = null;
}

$('#search-btn').addEventListener('click', open);
$('#search-kbd').addEventListener('click', () => { if (items.length) $('.search__item.is-active', list)?.click(); });
dialog.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
input.addEventListener('input', render);

list.addEventListener('mousemove', e => {
  const el = e.target.closest('.search__item');
  if (el && +el.dataset.i !== active) { active = +el.dataset.i; markActive(); }
});

// управление с клавиатуры: Ctrl/⌘+K, стрелки, Enter, Esc; Tab крутится внутри окна
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    dialog.hidden ? open() : close();
    return;
  }
  if (dialog.hidden) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!items.length) return;
    active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    markActive();
  } else if (e.key === 'Enter' && document.activeElement === input) {
    e.preventDefault();
    $('.search__item.is-active', list)?.click();
  } else if (e.key === 'Tab') {
    const focusable = $$('input, button, a[href]', dialog).filter(el => el.offsetParent !== null);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
