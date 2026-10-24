// Кнопка-молния «Экономия трафика»: переключатель + подсказка (наведение, фокус, нажатие).

import { $ } from './util.js';
import { isLite, setLite } from './images.js';

const button = $('#lite-btn');
const tip = $('#lite-tip');
let hideTimer = 0;

const text = on => (on
  ? 'Экономия трафика включена: картинки в низком качестве'
  : 'Экономия трафика выключена: картинки в обычном качестве');

function render() {
  const on = isLite();
  button.setAttribute('aria-pressed', String(on));
  tip.textContent = text(on);
}

// после нажатия подсказка видна пару секунд (на телефоне наведения нет)
function flash() {
  tip.classList.add('is-shown');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => tip.classList.remove('is-shown'), 2500);
}

button.addEventListener('click', () => {
  setLite(!isLite());
  render();
  flash();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') tip.classList.remove('is-shown'); });

render();
