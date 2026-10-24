// Адреса страниц. База (BASE_URL) учитывается автоматически: на GitHub Pages сайт живёт в подпапке.

const base = import.meta.env.BASE_URL; // всегда с косой чертой на конце

export const href = (path = '') => base + path;
export const absUrl = (path = '') => new URL(base + path, import.meta.env.SITE).href;

export const route = {
  home: '',
  newsPage: (n: number) => (n === 1 ? '' : `news/page/${n}/`),
  article: (slug: string) => `news/${slug}/`,
  tag: (slug: string) => `tag/${slug}/`,
  section: (slug: string) => (slug === 'novosti' ? '' : `section/${slug}/`),
  digest: (slug: string) => `digest/${slug}/`,
  about: 'about/',
};
