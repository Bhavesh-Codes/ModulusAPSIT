const STOP_WORDS = new Set(["and", "of", "the", "to", "in", "for", "with", "a", "an", "i", "ii", "iii"])

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Light plural handling so "Systems" and "System" count as the same word.
const singular = (t: string) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t)

function tokens(name: string): string[] {
  return normalizeName(name)
    .split(" ")
    .filter((t) => t && !STOP_WORDS.has(t))
    .map(singular)
}

/** True when two subject names are probably the same subject written differently. */
export function namesLookSimilar(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return false
  if (na === nb) return true

  const ta = tokens(a)
  const tb = tokens(b)
  if (ta.length === 0 || tb.length === 0) return false

  const setB = new Set(tb)
  const shared = new Set(ta.filter((t) => setB.has(t))).size
  const union = new Set([...ta, ...tb]).size

  // "Operating Systems" vs "Operating Systems Lab" (2/3) is a different subject; wording changes are not.
  return shared / union >= 0.75
}
