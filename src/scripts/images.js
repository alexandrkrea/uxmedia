// Картинки: обычные <picture> лежат прямо в HTML (их делает Astro: avif/webp, ширина 900, качество 40).
// Скелетон показывается, пока файл не загрузился. Режим молнии (качество 5) переключается заменой адресов:
// у каждого <source> и <img> в data-full лежит обычная версия, в data-lite — лёгкая.

import { $, $$, store } from './util.js';

const KEY = 'lite';
const phone = window.matchMedia('(max-width: 640px)');

// выбор пользователя важнее; если его нет — на телефоне лёгкий режим включён
const saved = store.get(KEY);
let lite = saved === null ? phone.matches : saved === '1';

export const isLite = () => lite;
const pick = el => (lite ? el.dataset.lite : el.dataset.full);

// слот считается готовым, когда загрузилась картинка (или упала: тогда скелетон тоже убираем)
export function markReady(ph) {
  const img = $('img', ph);
  if (!img) return;
  const done = () => ph.classList.add('is-ready');
  if (img.complete && img.naturalWidth) done();
  else {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  }
}
export function watchPhs(root = document) {
  $$('.ph:not(.is-ready)', root).forEach(markReady);
}

// переключить картинки на текущее качество; <source media> (телефон по умолчанию) убираем: дальше управляет JS
export function applyQuality(root = document) {
  $$('.ph picture:not([data-fixed])', root).forEach(pic => {
    $$('source[data-full]', pic).forEach(s => { const url = pick(s); if (url) s.srcset = url; });
    $$('source[data-mq]', pic).forEach(s => s.remove());
    const img = $('img', pic);
    const url = pick(img);
    if (url && img.getAttribute('src') !== url) {
      const ph = pic.closest('.ph');
      ph.classList.remove('is-ready');
      img.src = url;
      markReady(ph);
    }
  });
}

// заменить фото в слоте (галерея). slide: { alt, avif, webp, avifLite, webpLite }
export function setPicture(ph, slide) {
  const pic = $('picture', ph);
  const img = $('img', pic);
  $$('source[data-mq]', pic).forEach(s => s.remove());
  $$('source', pic).forEach(s => {
    const avif = s.type === 'image/avif';
    s.dataset.full = avif ? slide.avif : slide.webp;
    s.dataset.lite = avif ? slide.avifLite : slide.webpLite;
  });
  img.dataset.full = slide.webp;
  img.dataset.lite = slide.webpLite;
  img.alt = slide.alt;
  applyQuality(ph);
}

export function setLite(value, { remember = true } = {}) {
  lite = value;
  if (remember) store.set(KEY, value ? '1' : '0');
  document.body.classList.toggle('fx-on', lite); // зерно на картинках
  applyQuality();
  document.dispatchEvent(new CustomEvent('litechange', { detail: { lite } }));
}

// стартовое состояние
document.body.classList.toggle('fx-on', lite);
applyQuality();
watchPhs();
