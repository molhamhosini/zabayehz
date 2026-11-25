import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/cart', '/search', '/checkout', '/account', '/login', '/en/cart', '/en/search', '/en/checkout', '/en/account', '/en/login'] }], sitemap: `${SITE_URL}/sitemap.xml` };
}
