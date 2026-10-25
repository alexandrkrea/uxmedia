// Админка Keystatic: открывается на /keystatic при запуске `npm run dev`.
// Правки сохраняются обычными файлами в src/content (md/json) и src/assets — их коммитят в git.
// Поля совпадают со схемой в src/content.config.ts.
import { config, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';

const SECTIONS = ['новости', 'статьи', 'обзоры', 'дизайн', 'лайфхаки', 'кино', 'игры', 'авто'];

// Картинки внутри текста лежат рядом с обложками и подключаются по пути /src/assets/news/<файл>
const bodyImage = fields.image({
  label: 'Фото',
  directory: 'src/assets/news',
  publicPath: '/src/assets/news/',
  validation: { isRequired: true },
});

export default config({
  // Пока файлы лежат в проекте: правки идут на диск, дальше коммит.
  // Для редакторов на сервере переключается на { kind: 'github', repo: 'владелец/репозиторий' }.
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'UXM.BY' },
    navigation: {
      'Страницы': ['home', 'about'],
      'Материалы': ['news', 'tags'],
      'Сайт': ['site'],
    },
  },

  singletons: {
    home: singleton({
      label: 'Главная',
      path: 'src/content/home/',
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Заголовок на главной', description: 'Большой заголовок справа от ленты (h1). Одно предложение.', validation: { isRequired: true } }),
        intro: fields.text({
          label: 'Вступление',
          description: 'Абзацы под заголовком. Пустая строка между абзацами делит текст на абзацы.',
          multiline: true,
          validation: { isRequired: true },
        }),
        pinned: fields.relationship({
          label: 'Закреплённая новость',
          description: 'Эта новость всегда первая в ленте. Если пусто, лента идёт по дате: свежие сверху.',
          collection: 'news',
        }),
      },
    }),

    about: singleton({
      label: 'О проекте',
      path: 'src/content/about/',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({ label: 'Заголовок страницы', validation: { isRequired: true } }),
        lead: fields.text({ label: 'Лид', description: '1–2 предложения. Попадает в описание для поисковиков.', multiline: true, validation: { isRequired: true } }),
        summary: fields.array(fields.text({ label: 'Пункт' }), {
          label: 'Коротко и по делу',
          itemLabel: props => props.value || 'Пункт',
          validation: { length: { min: 1, max: 5 } },
        }),
        content: fields.mdx({
          label: 'Текст',
          description: 'Заголовки «Контакты», «Реклама» и «Предложить новость» не переименовывайте: на них ведут ссылки в боковом меню.',
          options: { heading: [2] },
        }),
      },
    }),

    site: singleton({
      label: 'Настройки сайта',
      path: 'src/content/site/',
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Название сайта', validation: { isRequired: true } }),
        title: fields.text({ label: 'Заголовок для поисковиков (title)', description: 'Показывается во вкладке и в выдаче. До 70 символов.', validation: { isRequired: true } }),
        description: fields.text({ label: 'Описание сайта', description: 'Для поисковиков, соцсетей и RSS. До 160 символов.', multiline: true, validation: { isRequired: true } }),
        email: fields.text({ label: 'Почта редакции', validation: { isRequired: true } }),
        authorName: fields.text({ label: 'Автор по умолчанию', description: 'Подпись «Автор» у всех материалов.', validation: { isRequired: true } }),
        telegram: fields.text({ label: 'Telegram (ссылка)', description: 'Пусто: в меню остаётся ссылка-заглушка.' }),
        youtube: fields.text({ label: 'YouTube (ссылка)' }),
        instagram: fields.text({ label: 'Instagram (ссылка)' }),
        tiktok: fields.text({ label: 'TikTok (ссылка)' }),
        footerText: fields.text({ label: 'Текст в подвале', multiline: true }),
      },
    }),
  },

  collections: {
    news: collection({
      label: 'Новости',
      slugField: 'title',
      path: 'src/content/news/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['date', 'section'],
      schema: {
        title: fields.slug({
          name: { label: 'Заголовок', validation: { isRequired: true } },
          slug: { label: 'Адрес (латиницей)', description: 'Часть ссылки: /news/<адрес>/. После публикации не меняйте.' },
        }),
        lead: fields.text({ label: 'Лид', description: '1–2 предложения: главное. Попадает в описание для поисковиков.', multiline: true, validation: { isRequired: true } }),
        date: fields.datetime({ label: 'Дата публикации', defaultValue: { kind: 'now' } }),
        updated: fields.datetime({ label: 'Обновлено', description: 'Заполняйте, когда меняете материал.' }),
        section: fields.select({
          label: 'Раздел',
          options: SECTIONS.map(s => ({ label: s, value: s })),
          defaultValue: 'новости',
        }),
        tags: fields.multiRelationship({ label: 'Теги', collection: 'tags' }),
        image: fields.image({
          label: 'Обложка',
          description: 'Желательно 16:9, ширина от 1200 px. Остальные размеры сайт сделает сам.',
          directory: 'src/assets/news',
          publicPath: '../../assets/news/',
          validation: { isRequired: true },
        }),
        summary: fields.array(fields.text({ label: 'Пункт' }), {
          label: 'Коротко и по делу',
          description: '3 коротких пункта: суть материала. Показываются под обложкой.',
          itemLabel: props => props.value || 'Пункт',
          validation: { length: { min: 1, max: 5 } },
        }),
        banner: fields.relationship({
          label: 'Баннер справа',
          description: 'Какая новость показывается справа от этой статьи (на широких экранах). Если пусто, показывается баннер по умолчанию.',
          collection: 'news',
        }),
        promo: fields.checkbox({ label: 'Баннер по умолчанию', description: 'Узкая карточка справа для всех страниц, где свой баннер не выбран. Отметьте только одну новость. В ленту она не попадает.' }),
        draft: fields.checkbox({ label: 'Черновик', description: 'Не показывается на сайте.' }),
        content: fields.mdx({
          label: 'Текст',
          options: { heading: [2], image: { directory: 'src/assets/news', publicPath: '../../assets/news/' } },
          components: {
            Gallery: block({
              label: 'Галерея',
              schema: {
                slides: fields.array(
                  fields.object({
                    image: bodyImage,
                    alt: fields.text({ label: 'Описание для скринридеров (alt)', validation: { isRequired: true } }),
                    caption: fields.text({ label: 'Подпись' }),
                  }),
                  { label: 'Кадры', itemLabel: props => props.fields.alt.value || 'Кадр' },
                ),
              },
            }),
            Figure: block({
              label: 'Картинка на всю ширину',
              schema: {
                image: bodyImage,
                alt: fields.text({ label: 'Описание для скринридеров (alt)', validation: { isRequired: true } }),
                caption: fields.text({ label: 'Подпись' }),
              },
            }),
            Quote: wrapper({
              label: 'Цитата с источником',
              schema: {
                source: fields.text({ label: 'Кто сказал / где опубликовано', validation: { isRequired: true } }),
                url: fields.url({ label: 'Ссылка на источник' }),
              },
            }),
            Checks: wrapper({ label: 'Список с галочками', schema: {} }),
          },
        }),
      },
    }),

    tags: collection({
      label: 'Теги',
      slugField: 'name',
      path: 'src/content/tags/*',
      format: 'json',
      schema: {
        name: fields.slug({
          name: { label: 'Название', validation: { isRequired: true } },
          slug: { label: 'Адрес (латиницей)', description: 'Часть ссылки: /tag/<адрес>/.' },
        }),
        desc: fields.text({ label: 'Описание для страницы тега', multiline: true, validation: { isRequired: true } }),
      },
    }),
  },
});
