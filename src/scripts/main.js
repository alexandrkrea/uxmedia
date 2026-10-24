// Точка входа: общие модули для всех страниц, остальное подключается только там, где нужно.

import './images.js';   // первым: ставит режим картинок до остальных
import './theme.js';
import './menu.js';
import './lite.js';
import './search.js';

if (document.querySelector('.pager-block')) import('./pager.js');
if (document.querySelector('#gallery')) import('./gallery.js');

document.getElementById('to-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
