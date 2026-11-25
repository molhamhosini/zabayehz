import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/cart', '/search', '/checkout', '/en/cart', '/en/search', '/en/checkout'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
