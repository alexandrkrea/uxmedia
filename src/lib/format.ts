// Даты по времени редакции (Минск), независимо от часового пояса сервера.

const TZ = 'Europe/Minsk';
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ru-RU', { timeZone: TZ, ...o }).format(d);

export const dayLabel = (d: Date) => fmt(d, { day: 'numeric', month: 'long' }); // 22 октября
export const dateLabel = (d: Date) => `${fmt(d, { hour: '2-digit', minute: '2-digit' })}, ${dayLabel(d)}`; // 19:00, 22 октября
export const dateLong = (d: Date) => fmt(d, { day: 'numeric', month: 'long', year: 'numeric' });
export const iso = (d: Date) => d.toISOString();

// «19–25 октября» или «28 октября – 3 ноября»
export function rangeLabel(from: Date, to: Date) {
  const sameMonth = fmt(from, { month: 'numeric' }) === fmt(to, { month: 'numeric' });
  return sameMonth ? `${fmt(from, { day: 'numeric' })}–${dayLabel(to)}` : `${dayLabel(from)} – ${dayLabel(to)}`;
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many;
};

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.trim().split(/\s+/).length / 180));
