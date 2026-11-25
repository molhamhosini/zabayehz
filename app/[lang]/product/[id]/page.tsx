import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/Gallery';
import { ProductBuy } from '@/components/ProductBuy';
import { ProductCard } from '@/components/ProductCard';
import { StarIcon } from '@/components/icons';
import { getCategories, getCategoryProducts, getProduct } from '@/lib/api';
import { alternates, pageLang, type Lang } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import { tools } from '@/lib/t';

export const revalidate = 120;

type Props = { params: Promise<{ lang: string; id: string }> };

async function load(lang: Lang, idStr: string) {
  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 ? getProduct(id, lang) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = await pageLang(params);
  const { t } = tools(lang);
  const p = await load(lang, (await params).id);
  if (!p) return { title: t.productNotFound };
  const description = (p.description || t.productDesc(p.name)).slice(0, 160);
  return {
    title: p.name,
    description,
    alternates: alternates(lang, `/product/${p.id}`),
    openGraph: { title: p.name, description, images: p.images[0] ? [{ url: p.images[0] }] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const lang = await pageLang(params);
  const { t, href } = tools(lang);
  const p = await load(lang, (await params).id);
  if (!p) notFound();
  const [cats, related] = await Promise.all([
    getCategories(lang),
    p.categoryId ? getCategoryProducts(p.categoryId, lang).catch(() => []) : Promise.resolve([]),
  ]);
  const cat = cats.find((c) => c.id === p.categoryId);
  const more = related.filter((r) => r.id !== p.id).slice(0, 8);
  const description = p.description || (lang === 'en' ? t.productDesc(p.name) : '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images,
    description: description || undefined,
    sku: String(p.id),
    brand: { '@type': 'Brand', name: t.siteName },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}${href(`/product/${p.id}`)}`,
      priceCurrency: 'AED',
      price: p.finalPrice,
      availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(p.rating && p.reviews.length
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews.length } }
      : {}),
  };

  return (
    <div className="wrap pd-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="crumbs" aria-label={t.breadcrumbs}>
        <Link href={href('/')}>{t.home}</Link><span>/</span>
        {cat && <><Link href={href(`/category/${cat.id}`)}>{cat.name}</Link><span>/</span></>}
        <span>{p.name}</span>
      </nav>
      <div className="pd" style={{ marginTop: 8 }}>
        <Gallery images={p.images} alt={p.name} />
        <div>
          <h1>{p.name}</h1>
          <div className="sub">
            <span>{t.pricePer(t.units[p.unit] ?? p.unit)}</span>
            {p.rating && (
              <span style={{ color: 'var(--gold)', display: 'inline-flex', gap: 4, alignItems: 'center', fontWeight: 600 }}>
                <StarIcon /> <span className="amt">{p.rating}</span>
                {p.reviews.length > 0 && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(<span className="amt">{p.reviews.length}</span> {t.reviewsCount})</span>}
              </span>
            )}
          </div>
          <ProductBuy p={p} />
          {description && (
            <section className="desc">
              <h2>{t.aboutProduct}</h2>
              <p>{description}</p>
            </section>
          )}
          {p.reviews.length > 0 && (
            <section className="desc">
              <h2>{t.reviews}</h2>
              <div className="reviews">
                {p.reviews.map((r) => (
                  <article key={r.id} className="review">
                    <header>
                      <b>{r.name}</b>
                      <span style={{ color: 'var(--gold)' }} aria-label={t.outOf5(r.rating)}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </header>
                    {r.comment && <p dir="auto">{r.comment}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      {more.length > 0 && (
        <section className="section" aria-labelledby="more-h">
          <div className="section-head"><h2 id="more-h">{t.youMayLike}</h2></div>
          <div className="row">{more.map((r) => <ProductCard key={r.id} p={r} lang={lang} />)}</div>
        </section>
      )}
    </div>
  );
}
