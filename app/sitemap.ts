import type { MetadataRoute } from 'next';
import { getAllProductIds, getCategories } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, ids] = await Promise.all([getCategories(), getAllProductIds()]);
  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    ...cats.map((c) => ({ url: `${SITE_URL}/category/${c.id}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...ids.map((id) => ({ url: `${SITE_URL}/product/${id}`, changeFrequency: 'weekly' as const, priority: 0.7 })),
  ];
}
