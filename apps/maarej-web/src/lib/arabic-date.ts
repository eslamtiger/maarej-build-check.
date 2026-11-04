const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
  day: "numeric", month: "long", year: "numeric", numberingSystem: "latn", timeZone: "Africa/Cairo",
});

// Accept existing ISO and legacy DD-MM-YYYY records without changing storage.
export function formatArabicDate(value: string) {
  const legacy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = legacy ? new Date(`${legacy[3]}-${legacy[2]}-${legacy[1]}T12:00:00Z`)
    : isoDate ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}
