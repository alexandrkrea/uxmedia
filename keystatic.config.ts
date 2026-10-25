// Админка Keystatic: открывается на /keystatic при запуске `npm run dev`.
// Правки сохраняются обычными файлами в src/content (md/json) и src/assets — их коммитят в git.
// Поля совпадают со схемой в src/content.config.ts.
import { config, collection, fields } from '@keystatic/core';
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
  ui: { brand: { name: 'UXM.BY' } },

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
        promo: fields.checkbox({ label: 'Узкая карточка справа', description: 'Только одна новость. В ленту не попадает.' }),
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
