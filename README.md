# UXM.BY

Новостной сайт на [Astro](https://astro.build) с админкой [Keystatic](https://keystatic.com): страницы статические, контент лежит файлами в репозитории, редакторы работают через форму.

## Команды

```bash
npm install     # один раз
npm run dev     # сайт на http://localhost:5173 и админка на http://localhost:5173/keystatic/
npm run build   # собрать сайт в папку dist
npm test        # собрать и прогнать автотесты
```

Нужен Node 22.23+ (проверено на 24).

## Структура

```
keystatic.config.ts      админка: поля новостей и тегов
astro.config.mjs         настройки Astro (адрес сайта, MDX, sitemap)
src/
  content/news/*.mdx     новости (текст + поля вверху файла)
  content/tags/*.json    теги
  content.config.ts      схема контента (те же поля, что в админке)
  content/site, home, about  настройки сайта, главная и «О проекте» (правятся в админке)
  data/site.ts           читает настройки; разделы меню, итоги недели, флаг indexable
  assets/news/           картинки новостей (оригиналы; нужные размеры и форматы Astro делает сам)
  assets/fonts/          Roboto Flex (кириллица и латиница, woff2)
  layouts/               Base (каркас), FeedPage (главная и архив), ListPage (теги и разделы)
  components/            шапка, меню, подвал, поиск, карточки, пагинация, крошки, Pic (картинка), mdx/ (галерея, цитата…)
  pages/                 главная, news/[slug], news/page/[page], tag/[tag], section/[section], digest/[slug], about, 404,
                         rss.xml, robots.txt, llms.txt, search-data.json
  lib/                   выборки новостей, даты, адреса, JSON-LD, иконки
  styles/                CSS по модулям (токены, база, раскладка, компоненты, статья, галерея)
  scripts/               ES-модули: тема, меню, картинки и режим молнии, поиск, пагинация, галерея
tests/                   автотесты собранного сайта (dist)
docs/                    PROCESS.md (как мы работали), CONTENT.md (как заполнять сайт)
```

## Как заполнять сайт

Подробно: [docs/CONTENT.md](docs/CONTENT.md). Коротко: `npm run dev` → `/keystatic/` → «Новости» → «Создать». Кнопка **Save** записывает файл в проект, дальше обычный коммит в git.

## Тестовый стенд на GitHub Pages

При каждом пуше в ветку `main` workflow `.github/workflows/deploy.yml` собирает сайт, запускает автотесты и выкладывает его на GitHub Pages. Включить один раз: **Settings → Pages → Source: GitHub Actions**. Адрес стенда: `https://<владелец>.github.io/<репозиторий>/`.

Админка Keystatic на стенде не работает: она нужна только на компьютере редактора (`npm run dev`). Когда понадобится правка контента с любого устройства, подключается режим GitHub (`storage.kind: 'github'`) и хостинг с сервером (Vercel, Netlify, Cloudflare).

## Перед запуском

1. `astro.config.mjs`: настоящий адрес сайта в `site` (или переменная окружения `SITE_URL`).
2. `src/data/site.ts`: почта, описание. Собрать с `INDEXABLE=true`, чтобы убрать `noindex` и открыть `robots.txt`.
3. В `src/pages/robots.txt.ts` решить, пускать ли ИИ-краулеров (строки закомментированы).
4. Заменить тексты-заглушки, добавить ссылки на соцсети в `src/lib/seo.ts` (`sameAs`) и в меню.
5. Подтвердить сайт в Яндекс Вебмастере и Search Console, отправить `sitemap-index.xml`.

## Картинки

Достаточно загрузить фото (желательно 16:9, ширина от 1200 px) в админке. Astro на сборке делает avif и webp шириной 900 с качеством 40, а для режима экономии трафика качество 5, плюс миниатюры 256 px. Обложка для соцсетей (1200×630) тоже делается автоматически.
