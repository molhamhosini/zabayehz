import type { MetadataRoute } from 'next';
import { getAllProductIds, getCategories } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, ids] = await Promise.all([getCategories(), getAllProductIds()]);
  // Each page is listed once, in Arabic, with its English version as an alternate.
  const entry = (path: string, changeFrequency: 'daily' | 'weekly', priority: number) => ({
    url: `${SITE_URL}${path === '/' ? '' : path}`,
    changeFrequency,
    priority,
    alternates: { languages: { ar: `${SITE_URL}${path === '/' ? '' : path}`, en: `${SITE_URL}/en${path === '/' ? '' : path}` } },
  });
  return [
    entry('/', 'daily', 1),
    ...cats.map((c) => entry(`/category/${c.id}`, 'daily', 0.8)),
    ...ids.map((id) => entry(`/product/${id}`, 'weekly', 0.7)),
  ];
}
