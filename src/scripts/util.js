// Мелкие помощники, общие для всех модулей

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// localStorage может быть недоступен (приватный режим), поэтому всё в try/catch
export const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* ничего */ } },
};

// Пока открыто окно (поиск, просмотр фото, меню), остальная страница «выключается»:
// фокус и скринридер не уходят под окно. Возвращает функцию, которая всё включает обратно.
export function lockBackground(elements) {
  const opener = document.activeElement;
  elements.forEach(el => el && el.setAttribute('inert', ''));
  return function unlock() {
    elements.forEach(el => el && el.removeAttribute('inert'));
    if (opener && opener.focus && document.contains(opener)) opener.focus();
  };
}

// Ждём, пока страница докрутится до нужной высоты (или остановится)
export function waitForScroll(target) {
  return new Promise(resolve => {
    const t0 = performance.now();
    let last = window.scrollY, still = 0;
    const tick = () => {
      const y = window.scrollY, elapsed = performance.now() - t0;
      still = y === last ? still + 1 : 0;
      last = y;
      const reached = Math.abs(y - target) <= 2 || still > 6;
      if ((reached && elapsed > 300) || elapsed > 2000) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
}
