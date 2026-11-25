import type {
  ApiBanner,
  ApiCategory,
  ApiConfig,
  ApiProduct,
  ChoiceGroup,
  ProductCard,
  ProductDetail,
} from './types';
import { bestDiscount, finalPrice } from './price';
import { categoryName, hasArabic, type Lang } from './i18n';

const API = (process.env.API_BASE_URL || 'https://poszabayeh.com').replace(/\/$/, '');
const MOCK = process.env.MOCK_API === '1';
// How long (seconds) a cached API response is reused before Next.js refetches it in the background.
const REVALIDATE = 120;

// Only these categories are sold on the website; everything else (POS-only items) stays hidden.
// The list order is also the order categories appear on the site.
// Override with SHOP_CATEGORY_IDS="17,16,15,13" in the environment.
// 17 الخروف · 16 الماعز · 15 العروض · 13 ملحمة
const SHOP_ORDER = (process.env.SHOP_CATEGORY_IDS || '17,16,15,13').split(',').map((x) => Number(x.trim())).filter(Number.isFinite);
export const SHOP_CATEGORIES = new Set(SHOP_ORDER);

/** True when the product belongs to at least one of the shop categories. */
export function isShopProduct(p: Pick<ApiProduct, 'category_ids'>): boolean {
  return (p.category_ids ?? []).some((c) => SHOP_CATEGORIES.has(Number(c.id)));
}

type Fixtures = {
  config: ApiConfig;
  categories: ApiCategory[];
  banners: ApiBanner[];
  popular: number[];
  products: ApiProduct[];
};

let fixtures: Promise<Fixtures> | null = null;
function loadFixtures(): Promise<Fixtures> {
  fixtures ??= import('../fixtures/data.json').then((m) => m.default as unknown as Fixtures);
  return fixtures;
}

async function get<T>(path: string, revalidate = REVALIDATE, lang: Lang = 'ar'): Promise<T> {
  // The language is also put in the address so the two languages are cached separately.
  const url = `${API}/api/v1/${path}${path.includes('?') ? '&' : '?'}lang=${lang}`;
  const res = await fetch(url, {
    headers: { 'X-localization': lang, Accept: 'application/json' },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// ---------- config & images ----------

export async function getConfig(): Promise<ApiConfig> {
  if (MOCK) return (await loadFixtures()).config;
  return get<ApiConfig>('config', 600);
}

function joinUrl(base: string, file?: string | null): string | null {
  if (!file) return null;
  if (/^https?:\/\//.test(file)) return file;
  return `${base.replace(/\/$/, '')}/${file}`;
}

// ---------- mapping (keeps payloads to the browser small) ----------

function ratingOf(p: ApiProduct): number | null {
  const v = Number(p.rating?.[0]?.average);
  return Number.isFinite(v) && v > 0 ? Math.round(v * 10) / 10 : null;
}

/** English names from the system are sometimes lower case ("Naimi sheep"). */
function nameOf(p: ApiProduct, lang: Lang): string {
  const n = p.name.trim();
  return lang === 'en' ? n.charAt(0).toUpperCase() + n.slice(1) : n;
}

function toCard(p: ApiProduct, cfg: ApiConfig, lang: Lang = 'ar'): ProductCard {
  const d = bestDiscount(p, p.price);
  return {
    id: p.id,
    name: nameOf(p, lang),
    image: joinUrl(cfg.base_urls.product_image_url, p.image?.[0]),
    price: p.price,
    finalPrice: finalPrice(p.price, d),
    unit: p.unit === 'kg' ? 'kg' : 'pc',
    rating: ratingOf(p),
    inStock: (p.total_stock ?? 1) > 0,
  };
}

function isRequired(v: ApiProduct['choice_options'] extends (infer C)[] | undefined ? C : never): boolean {
  const r = v.required;
  if (r === undefined || r === null) return true;
  if (typeof r === 'boolean') return r;
  return String(r) === '1' || String(r).toLowerCase() === 'true';
}

function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toDetail(p: ApiProduct, cfg: ApiConfig, lang: Lang = 'ar'): ProductDetail {
  const card = toCard(p, cfg, lang);
  const description = stripHtml(p.description);
  const choices: ChoiceGroup[] = (p.choice_options ?? []).map((c) => {
    const kind: ChoiceGroup['kind'] =
      c.display_type === 'multi_image' ? 'multi' : c.display_type === 'image' ? 'image' : 'text';
    return {
      title: c.title.trim(),
      kind,
      required: kind === 'multi' ? false : isRequired(c),
      options: c.options.map((label, i) => ({
        label: label.trim(),
        image: kind === 'text' ? null : c.option_images?.[i] || null,
      })),
    };
  });
  const variants: Record<string, [number, number]> = {};
  for (const v of p.variations ?? []) variants[v.type.replace(/\s+/g, '')] = [v.price, v.stock];
  const d = bestDiscount(p, p.price);
  return {
    ...card,
    // An Arabic-only description is left out of the English page (it shows a short English line instead).
    description: lang === 'en' && hasArabic(description) ? '' : description,
    images: (p.image ?? []).map((f) => joinUrl(cfg.base_urls.product_image_url, f)!).filter(Boolean),
    maxQty: Number(p.maximum_order_quantity) || 10,
    discount: d,
    choices,
    variants,
    reviews: (p.active_reviews ?? []).map((r) => ({
      id: r.id,
      name: [r.customer?.f_name, r.customer?.l_name].filter(Boolean).join(' ').trim() || (lang === 'en' ? 'Customer' : 'عميل'),
      rating: r.rating,
      comment: r.comment ?? '',
      date: r.created_at,
    })),
    categoryId: Number((p.category_ids ?? []).find((c) => SHOP_CATEGORIES.has(Number(c.id)))?.id) || null,
  };
}

// ---------- public data functions ----------

export async function getCategories(lang: Lang = 'ar') {
  const cfg = await getConfig();
  const list = MOCK ? (await loadFixtures()).categories : await get<ApiCategory[]>('categories', 600, lang);
  return list
    .filter((c) => SHOP_CATEGORIES.has(Number(c.id)))
    .sort((x, y) => SHOP_ORDER.indexOf(Number(x.id)) - SHOP_ORDER.indexOf(Number(y.id)))
    .map((c) => ({ id: c.id, name: categoryName(lang, c.id, c.name.trim()), image: joinUrl(cfg.base_urls.category_image_url, c.image) }));
}

export async function getBanners(lang: Lang = 'ar') {
  const cfg = await getConfig();
  const list = MOCK ? (await loadFixtures()).banners : await get<ApiBanner[]>('banners', 600, lang);
  return list.filter((b) => !b.category_id || SHOP_CATEGORIES.has(Number(b.category_id))).map((b) => ({
    id: b.id,
    title: b.title && b.title.trim() !== '.' && !(lang === 'en' && hasArabic(b.title)) ? b.title.trim() : '',
    image: joinUrl(cfg.base_urls.banner_image_url, b.image)!,
    href: b.product_id ? `/product/${b.product_id}` : b.category_id ? `/category/${b.category_id}` : null,
  }));
}

export async function getCategoryProducts(categoryId: number, lang: Lang = 'ar'): Promise<ProductCard[]> {
  if (!SHOP_CATEGORIES.has(categoryId)) return [];
  const cfg = await getConfig();
  if (MOCK) {
    const all = (await loadFixtures()).products;
    return all.filter((p) => p.category_ids?.some((c) => Number(c.id) === categoryId)).map((p) => toCard(p, cfg, lang));
  }
  const list = await get<ApiProduct[]>(`categories/products/${categoryId}`, REVALIDATE, lang);
  return list.map((p) => toCard(p, cfg, lang));
}

export async function getPopular(limit = 10, lang: Lang = 'ar'): Promise<ProductCard[]> {
  const cfg = await getConfig();
  if (MOCK) {
    const f = await loadFixtures();
    return f.popular.map((id) => f.products.find((p) => p.id === id)!).filter(Boolean).filter(isShopProduct).slice(0, limit).map((p) => toCard(p, cfg, lang));
  }
  const r = await get<{ products: ApiProduct[] }>(`products/popular?limit=${limit * 4}&offset=1`, REVALIDATE, lang);
  return r.products.filter(isShopProduct).slice(0, limit).map((p) => toCard(p, cfg, lang));
}

export async function getLatest(limit = 10, lang: Lang = 'ar'): Promise<ProductCard[]> {
  const cfg = await getConfig();
  if (MOCK) return (await loadFixtures()).products.filter(isShopProduct).slice(0, limit).map((p) => toCard(p, cfg, lang));
  const r = await get<{ products: ApiProduct[] }>(`products/latest?limit=${limit * 4}&offset=1`, REVALIDATE, lang);
  return r.products.filter(isShopProduct).slice(0, limit).map((p) => toCard(p, cfg, lang));
}

export async function searchProducts(q: string, lang: Lang = 'ar', limit = 40): Promise<ProductCard[]> {
  const term = q.trim();
  if (!term) return [];
  const cfg = await getConfig();
  if (MOCK) {
    const norm = (s: string) => s.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/\s+/g, ' ');
    const t = norm(term);
    return (await loadFixtures()).products.filter((p) => isShopProduct(p) && norm(p.name).includes(t)).map((p) => toCard(p, cfg, lang));
  }
  const r = await get<{ products: ApiProduct[] }>(
    `products/search?name=${encodeURIComponent(term)}&limit=${limit * 3}&offset=1`,
    60,
    lang,
  );
  return r.products.filter(isShopProduct).slice(0, limit).map((p) => toCard(p, cfg, lang));
}

/** Raw product as the API returns it (used server-side to price orders). */
export async function getProductRaw(id: number): Promise<ApiProduct | null> {
  if (MOCK) {
    const p = (await loadFixtures()).products.find((x) => x.id === id);
    return p && isShopProduct(p) ? p : null;
  }
  try {
    const p = await get<ApiProduct>(`products/details/${id}`, 60);
    return isShopProduct(p) ? p : null;
  } catch (e) {
    if (String(e).includes('-> 404')) return null;
    throw e;
  }
}

export async function getProduct(id: number, lang: Lang = 'ar'): Promise<ProductDetail | null> {
  const cfg = await getConfig();
  if (MOCK) {
    const p = (await loadFixtures()).products.find((x) => x.id === id);
    return p && isShopProduct(p) ? toDetail(p, cfg, lang) : null;
  }
  try {
    const p = await get<ApiProduct>(`products/details/${id}`, REVALIDATE, lang);
    return isShopProduct(p) ? toDetail(p, cfg, lang) : null;
  } catch (e) {
    if (String(e).includes('-> 404')) return null;
    throw e;
  }
}

export async function getAllProductIds(): Promise<number[]> {
  if (MOCK) return (await loadFixtures()).products.filter(isShopProduct).map((p) => p.id);
  const r = await get<{ products: ApiProduct[] }>('products/latest?limit=200&offset=1', 3600);
  return r.products.filter(isShopProduct).map((p) => p.id);
}
