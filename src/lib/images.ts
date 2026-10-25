// Картинки внутри текста статьи (компоненты MDX): путь из админки → метаданные для astro:assets.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/news/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export function imageByPath(path: string): ImageMetadata {
  const found = files[path] ?? files['/' + path.replace(/^\/+/, '')];
  if (!found) throw new Error(`Картинка не найдена: ${path}. Файл должен лежать в src/assets/news/<адрес-статьи>/`);
  return found.default;
}
