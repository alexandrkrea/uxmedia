// Структурированные данные (JSON-LD) для поисковиков и нейросетей.
import { SITE } from '../data/site';
import { absUrl } from './url';

const orgId = () => `${absUrl()}#org`;

export const organization = () => ({
  '@type': 'Organization',
  '@id': orgId(),
  name: SITE.name,
  url: absUrl(),
  logo: { '@type': 'ImageObject', url: absUrl('favicon.svg') },
  email: SITE.email,
  // sameAs: ссылки на официальные соцсети — добавить, когда появятся реальные адреса
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': `${absUrl()}#website`,
  url: absUrl(),
  name: SITE.name,
  description: SITE.description,
  inLanguage: SITE.lang,
  publisher: { '@id': orgId() },
  // SearchAction добавим, когда появится страница поиска по адресу
});

// Крошки в разметке совпадают с теми, что видны на странице
export const breadcrumbs = (items: { name: string; path?: string }[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    ...(i < items.length - 1 ? { item: absUrl(c.path ?? '') } : {}),
  })),
});

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

export const authorOrg = () => ({ '@type': 'Organization', name: SITE.author.name, url: absUrl(SITE.author.path) });
export const publisherRef = () => ({ '@id': orgId() });
