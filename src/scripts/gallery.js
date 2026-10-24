// Галерея в статье: стрелки, миниатюры, счётчик, подпись; просмотр на весь экран с зумом пальцами.

import { $, $$, lockBackground } from './util.js';
import { setPicture } from './images.js';

const slides = JSON.parse($('#gallery-data').textContent);
const mainPh = $('#gallery-main');
const thumbs = $$('.gallery__thumb');
const counter = $('#gallery-count');
const caption = $('#gallery-caption');
let slide = 0;

function showSlide(i) {
  slide = (i + slides.length) % slides.length;
  const s = slides[slide];
  setPicture(mainPh, s);
  thumbs.forEach((b, j) => { b.classList.toggle('is-active', j === slide); b.setAttribute('aria-current', String(j === slide)); });
  counter.textContent = `${slide + 1} / ${slides.length}`;
  caption.textContent = s.caption || '';
  if (!lightbox.hidden) renderLightbox();
}

thumbs.forEach(b => b.addEventListener('click', () => showSlide(+b.dataset.i)));
$('#gallery-prev').addEventListener('click', () => showSlide(slide - 1));
$('#gallery-next').addEventListener('click', () => showSlide(slide + 1));

// свайп по фото на странице (телефон)
function addSwipe(el, onSwipe) {
  let x0 = null;
  el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) onSwipe(dx < 0 ? 1 : -1);
  }, { passive: true });
}
addSwipe(mainPh.parentElement, dir => showSlide(slide + dir));

// ——— Просмотр на весь экран ———
const lightbox = $('#lightbox');
const pic = $('#lightbox-pic');
const stage = $('#lightbox-stage');
const lbThumbs = $('#lightbox-thumbs');
const MAX_ZOOM = 4;
let zoom = 1, panX = 0, panY = 0;
let unlock = null;

lbThumbs.innerHTML = slides.map((s, i) =>
  `<button class="lightbox__thumb" type="button" data-i="${i}" aria-label="Фото ${i + 1}"><picture>` +
  `<source type="image/avif" srcset="${s.thumbAvif}"><img alt="" src="${s.thumbWebp}"></picture></button>`
).join('');
lbThumbs.addEventListener('click', e => {
  const b = e.target.closest('.lightbox__thumb');
  if (b) showSlide(+b.dataset.i);
});

function applyZoom() {
  const img = $('img', pic);
  if (img) {
    // не даём утащить фото за край: пан ограничен тем, насколько оно больше экрана
    const maxX = Math.max(0, (img.offsetWidth * zoom - stage.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * zoom - stage.clientHeight) / 2);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
  }
  pic.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  stage.classList.toggle('is-zoomed', zoom > 1);
}
function resetZoom() { zoom = 1; panX = 0; panY = 0; applyZoom(); }

function renderLightbox() {
  const s = slides[slide];
  // в просмотре всегда обычное качество: человек открыл фото, чтобы рассмотреть
  pic.innerHTML =
    `<source type="image/avif" srcset="${s.avif}">` +
    `<source type="image/webp" srcset="${s.webp}">` +
    `<img alt="${s.alt}" draggable="false" src="${s.webp}">`;
  $$('.lightbox__thumb', lbThumbs).forEach((b, j) => b.classList.toggle('is-active', j === slide));
  resetZoom();
}

function openLightbox() {
  unlock = lockBackground([$('.page')]);
  renderLightbox();
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  $('.lightbox__close', lightbox).focus();
}
function closeLightbox() {
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  unlock?.();
  unlock = null;
}

$('#gallery-max').addEventListener('click', openLightbox);
mainPh.addEventListener('click', openLightbox);
lightbox.addEventListener('click', e => { if (e.target.closest('[data-lb-close]')) closeLightbox(); });
$('#lightbox-prev').addEventListener('click', () => showSlide(slide - 1));
$('#lightbox-next').addEventListener('click', () => showSlide(slide + 1));

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') showSlide(slide - 1);
  else if (e.key === 'ArrowRight') showSlide(slide + 1);
  else if (e.key === '+' || e.key === '=') { zoom = Math.min(MAX_ZOOM, zoom * 1.4); applyZoom(); }
  else if (e.key === '-') { zoom = Math.max(1, zoom / 1.4); if (zoom === 1) { panX = 0; panY = 0; } applyZoom(); }
  else if (e.key === 'Tab') { // Tab крутится внутри окна
    const focusable = $$('button', lightbox).filter(el => el.offsetParent !== null);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

// указатели: один палец — перетаскивание (или свайп, когда фото не увеличено), два — щипок
const pointers = new Map();
let pinch = null, drag = null, lastTap = 0;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

stage.addEventListener('pointerdown', e => {
  try { stage.setPointerCapture(e.pointerId); } catch { /* синтетическое событие */ }
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: dist(a, b), zoom };
    drag = null;
  } else {
    drag = { x: e.clientX, y: e.clientY, panX, panY, t: performance.now(), moved: false };
  }
});

stage.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && pointers.size >= 2) {
    const [a, b] = [...pointers.values()];
    zoom = Math.max(1, Math.min(MAX_ZOOM, pinch.zoom * dist(a, b) / pinch.d));
    applyZoom();
  } else if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true;
    if (zoom > 1) { panX = drag.panX + dx; panY = drag.panY + dy; applyZoom(); }
  }
});

function endPointer(e) {
  if (!pointers.has(e.pointerId)) return;
  const wasPinch = !!pinch;
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinch = null;
  if (zoom < 1.05) resetZoom();
  if (wasPinch || !drag) { if (!pointers.size) drag = null; return; }
  const d = drag;
  drag = null;
  const dx = e.clientX - d.x, dy = e.clientY - d.y;
  if (zoom === 1 && d.moved && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
    showSlide(slide + (dx < 0 ? 1 : -1)); // свайп листает фото, пока оно не увеличено
  } else if (!d.moved && performance.now() - d.t < 300) {
    const now = performance.now();
    if (now - lastTap < 300) { // двойной тап: увеличить / вернуть
      lastTap = 0;
      if (zoom > 1) resetZoom();
      else {
        const r = stage.getBoundingClientRect();
        zoom = 2.5;
        panX = -(e.clientX - (r.left + r.width / 2)) * (zoom - 1);
        panY = -(e.clientY - (r.top + r.height / 2)) * (zoom - 1);
        applyZoom();
      }
    } else lastTap = now;
  }
}
stage.addEventListener('pointerup', endPointer);
stage.addEventListener('pointercancel', endPointer);

// колесо мыши на компьютере
stage.addEventListener('wheel', e => {
  e.preventDefault();
  zoom = Math.max(1, Math.min(MAX_ZOOM, zoom * Math.exp(-e.deltaY * 0.002)));
  if (zoom === 1) { panX = 0; panY = 0; }
  applyZoom();
}, { passive: false });
