import type { ApiProduct } from './types';

export type Discount = { type: 'percent' | 'amount'; value: number; max?: number } | null;

function apply(price: number, d: Discount): number {
  if (!d || !d.value) return price;
  let off = d.type === 'percent' ? (price * d.value) / 100 : d.value;
  if (d.max && d.max > 0) off = Math.min(off, d.max);
  return Math.max(0, price - off);
}

/** Same rule as the mobile app: use the category discount only when it is the better deal. */
export function bestDiscount(p: Pick<ApiProduct, 'discount' | 'discount_type' | 'category_discount'>, price: number): Discount {
  const product: Discount = p.discount
    ? { type: p.discount_type === 'amount' ? 'amount' : 'percent', value: Number(p.discount) }
    : null;
  const c = p.category_discount;
  if (c) {
    const cat: Discount = {
      type: c.discount_type === 'amount' ? 'amount' : 'percent',
      value: Number(c.discount_amount) || 0,
      max: Number(c.maximum_amount) || undefined,
    };
    const catPrice = apply(price, cat);
    if (catPrice >= 0 && catPrice < price && catPrice < apply(price, product)) return cat;
  }
  return product;
}

export function finalPrice(price: number, d: Discount): number {
  return Math.round(apply(price, d) * 100) / 100;
}

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export const CURRENCY = 'د.إ';

export function formatPrice(n: number, lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'en' ? `AED ${nf.format(n)}` : `${nf.format(n)} ${CURRENCY}`;
}
