// Меню на узких экранах: выезжает слева на весь экран, бургер превращается в крестик.

import { $, $$, lockBackground } from './util.js';

const button = $('#menu-btn');
const sidebar = $('#sidebar');
const desktop = window.matchMedia('(min-width: 961px)');
let unlock = null;

function setMenu(open) {
  if (open) document.documentElement.style.setProperty('--hdr-h', $('.header').offsetHeight + 'px');
  sidebar.classList.toggle('is-open', open);
  button.classList.toggle('is-open', open);
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Закрыть меню' : 'Меню');
  document.body.classList.toggle('menu-open', open);

  if (open) {
    // «выключаем» всё, кроме шапки и меню: Tab не уходит под меню
    unlock = lockBackground($$('.layout > :not(.sidebar), .footer'));
    $('a', sidebar)?.focus({ preventScroll: true });
  } else if (unlock) {
    unlock();
    unlock = null;
  }
}

const isOpen = () => sidebar.classList.contains('is-open');

button.addEventListener('click', () => setMenu(!isOpen()));
sidebar.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) setMenu(false); });
desktop.addEventListener('change', e => { if (e.matches && isOpen()) setMenu(false); });
