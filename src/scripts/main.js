// Точка входа: общие модули для всех страниц, остальное подключается только там, где нужно.

import './images.js';   // первым: ставит режим картинок до остальных
import './theme.js';
import './menu.js';
import './lite.js';
import './search.js';

if (document.querySelector('.pager-block')) import('./pager.js');
if (document.querySelector('#gallery')) import('./gallery.js');

document.getElementById('to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// кнопка «наверх» стоит по центру основной колонки (ленты или статьи), а не страницы: боковые колонки её не сдвигают
const footer = document.querySelector('.footer');
const column = document.querySelector('#content');
if (footer && column) {
  const place = () => {
    const f = footer.getBoundingClientRect();
    const c = column.getBoundingClientRect();
    footer.style.setProperty('--to-top-x', `${Math.round(c.left + c.width / 2 - f.left)}px`);
  };
  place();
  new ResizeObserver(place).observe(column);
  window.addEventListener('resize', place);
}
