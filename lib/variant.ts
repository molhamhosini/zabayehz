/** Variation keys in the API look like "11-8 كجم 2-4 شهور-غوزي كامل-أكياس-صندوق كرتون".
 *  Whitespace is not consistent between options and variation types, so compare without it. */
export function variantKey(parts: string[]): string {
  return parts.map((p) => p.replace(/\s+/g, '')).join('-');
}
