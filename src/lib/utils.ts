/** Format a number into Thai Baht, e.g. 1290 -> "฿1,290" */
export function formatBaht(amount: number | string): string {
  const num = Number(amount);
  if (!Number.isFinite(num)) return "฿0";
  const formatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  });
  return formatter.format(num);
}

export function discountPercent(
  price: number | string,
  compareAt: number | string | null | undefined
): number | null {
  const p = Number(price);
  const c = Number(compareAt ?? 0);
  if (!c || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

export function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${ymd}-${rand}`;
}