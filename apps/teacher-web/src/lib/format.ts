const nf = new Intl.NumberFormat("ar-EG", { maximumFractionDigits: 0 });
export const egp = (n: number) => `${nf.format(Math.round(n))} ج.م`;
export const num = (n: number) => nf.format(n);
export const pct = (n: number | null) => (n === null ? "—" : `${nf.format(Math.round(n))}٪`);

const day = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Cairo" });
const time = new Intl.DateTimeFormat("ar-EG", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Cairo" });
const short = new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", timeZone: "Africa/Cairo" });
export const fmtDay = (iso: string) => day.format(new Date(iso));
export const fmtTime = (iso: string) => time.format(new Date(iso));
export const fmtShort = (iso: string) => short.format(new Date(iso));

export const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

/** Start of the current week (Saturday 00:00, Egypt's week) as an ISO string. */
export function weekStartIso(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  return d.toISOString();
}
export const monthStartIso = (now = new Date()) => new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
export const hhmm = (t: string) => t.slice(0, 5);
export const hhmmAr = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "م" : "ص";
  return `${nf.format(h % 12 || 12)}:${String(m).padStart(2, "0").replace(/\d/g, (c) => nf.format(Number(c)))} ${ap}`;
};
