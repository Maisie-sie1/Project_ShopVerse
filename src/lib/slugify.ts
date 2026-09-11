/** Convert a string into a URL-friendly slug. Keeps latin letters, digits and dashes.
 *  For inputs that don't contain latin characters (e.g. pure Thai), falls back to a
 *  short deterministic hash so slugs are unique and non-empty.
 */
export function slugify(input: string): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

  if (normalized.length === 0) {
    // Deterministic hash fallback: e.g. "เครื่องดื่ม" -> "cat-8f3a"
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return `item-${hash.toString(36).slice(0, 6)}`;
  }

  // Mixed latin + non-latin names (e.g. "กระติกน้ำ 750ml") strip down to just
  // the latin part; append a short hash so the slug stays unique.
  if (normalized.length < 6 && /[^a-zA-Z0-9\s-]/.test(input)) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return `${normalized}-${hash.toString(36).slice(0, 4)}`;
  }

  return normalized;
}