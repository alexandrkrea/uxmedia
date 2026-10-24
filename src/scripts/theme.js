// Тема: светлая / тёмная. Начальное значение ставит скрипт в <head> (до отрисовки, без вспышки).
// Здесь — переключатель и реакция на смену системной темы, пока пользователь сам не выбирал.

import { $, store } from './util.js';

const root = document.documentElement;
const dark = window.matchMedia('(prefers-color-scheme: dark)');

$('#theme-btn').addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  store.set('theme', next);
});

dark.addEventListener('change', e => {
  if (!store.get('theme')) root.dataset.theme = e.matches ? 'dark' : 'light';
});
