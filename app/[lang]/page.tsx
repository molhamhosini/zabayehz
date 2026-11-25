import Image from 'next/image';
import Link from 'next/link';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { LeafIcon, ShieldIcon, StethIcon, TruckIcon } from '@/components/icons';
import { getBanners, getCategories, getCategoryProducts, getLatest, getPopular } from '@/lib/api';
import { pageLang } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import { tools } from '@/lib/t';

export const revalidate = 120;

const OFFERS_CATEGORY = 15; // "العروض"
const TRUST_ICONS = [ShieldIcon, StethIcon, TruckIcon, LeafIcon];

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = await pageLang(params);
  const { t, href } = tools(lang);
  const [banners, categories, offers, popular, latest] = await Promise.all([
    getBanners(lang),
    getCategories(lang),
    getCategoryProducts(OFFERS_CATEGORY, lang).catch(() => []),
    getPopular(10, lang),
    getLatest(8, lang),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: t.siteName,
    url: `${SITE_URL}${href('/') === '/' ? '' : href('/')}`,
    image: `${SITE_URL}/logo.png`,
    address: { '@type': 'PostalAddress', streetAddress: t.address, addressLocality: 'Abu Dhabi', addressCountry: 'AE' },
    parentOrganization: { '@type': 'Organization', name: t.company, legalName: t.company },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="wrap hero">
        <h1 className="sr-only">{t.siteName}: {t.tagline}</h1>
        {banners.length > 0 && <BannerCarousel banners={banners} />}
      </section>

      <section className="wrap section" aria-labelledby="cats-h">
        <div className="section-head"><h2 id="cats-h">{t.shopByCategory}</h2></div>
        <div className="cats">
          {categories.map((c) => (
            <Link key={c.id} href={href(`/category/${c.id}`)} className="cat">
              <span className="thumb">{c.image && <Image src={c.image} alt="" width={52} height={52} />}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="wrap section" aria-labelledby="offers-h">
          <div className="section-head">
            <h2 id="offers-h">{t.weekOffers}</h2>
            <Link href={href(`/category/${OFFERS_CATEGORY}`)}>{t.allOffers}</Link>
          </div>
          <div className="row">{offers.map((x, i) => <ProductCard key={x.id} p={x} lang={lang} priority={i < 2} />)}</div>
        </section>
      )}

      <section className="wrap section" aria-label={t.whyUs}>
        <div className="trust">
          {t.trust.map(([title, sub], i) => {
            const Icon = TRUST_ICONS[i];
            return <div key={title}><Icon size={28} /><p style={{ margin: 0 }}><b>{title}</b><span>{sub}</span></p></div>;
          })}
        </div>
      </section>

      <section className="wrap section" aria-labelledby="pop-h">
        <div className="section-head"><h2 id="pop-h">{t.popular}</h2></div>
        <div className="grid">{popular.map((x) => <ProductCard key={x.id} p={x} lang={lang} />)}</div>
      </section>

      {latest.length > 0 && (
        <section className="wrap section" aria-labelledby="new-h">
          <div className="section-head"><h2 id="new-h">{t.latest}</h2></div>
          <div className="row">{latest.map((x) => <ProductCard key={x.id} p={x} lang={lang} />)}</div>
        </section>
      )}
    </>
  );
}
