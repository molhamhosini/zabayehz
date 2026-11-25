import Image from 'next/image';
import Link from 'next/link';
import { BannerCarousel } from '@/components/BannerCarousel';
import { ProductCard } from '@/components/ProductCard';
import { LeafIcon, ShieldIcon, StethIcon, TruckIcon } from '@/components/icons';
import { getBanners, getCategories, getCategoryProducts, getLatest, getPopular } from '@/lib/api';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const revalidate = 120;

const OFFERS_CATEGORY = 15; // "العروض"

export default async function Home() {
  const [banners, categories, offers, popular, latest] = await Promise.all([
    getBanners(),
    getCategories(),
    getCategoryProducts(OFFERS_CATEGORY).catch(() => []),
    getPopular(10),
    getLatest(8),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    address: { '@type': 'PostalAddress', addressLocality: 'Abu Dhabi', addressCountry: 'AE' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="wrap hero">
        <h1 className="sr-only">{SITE_NAME}: ذبائح طازجة توصل لبيتك</h1>
        {banners.length > 0 && <BannerCarousel banners={banners} />}
      </section>

      <section className="wrap section" aria-labelledby="cats-h">
        <div className="section-head"><h2 id="cats-h">تسوّق حسب القسم</h2></div>
        <div className="cats">
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.id}`} className="cat">
              <span className="thumb">{c.image && <Image src={c.image} alt="" width={52} height={52} />}</span>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {offers.length > 0 && (
        <section className="wrap section" aria-labelledby="offers-h">
          <div className="section-head">
            <h2 id="offers-h">عروض هذا الأسبوع</h2>
            <Link href={`/category/${OFFERS_CATEGORY}`}>كل العروض</Link>
          </div>
          <div className="row">{offers.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 2} />)}</div>
        </section>
      )}

      <section className="wrap section" aria-label="لماذا ذبائح الجزيرة">
        <div className="trust">
          <div><ShieldIcon size={28} /><p style={{ margin: 0 }}><b>ذبح شرعي</b><span>يُذبح يوميًا حسب طلبك</span></p></div>
          <div><StethIcon size={28} /><p style={{ margin: 0 }}><b>إشراف بيطري</b><span>فحص كامل قبل الذبح</span></p></div>
          <div><TruckIcon size={28} /><p style={{ margin: 0 }}><b>توصيل مبرّد</b><span>من المسلخ إلى بابك</span></p></div>
          <div><LeafIcon size={28} /><p style={{ margin: 0 }}><b>تغذية طبيعية</b><span>من مزارعنا مباشرة</span></p></div>
        </div>
      </section>

      <section className="wrap section" aria-labelledby="pop-h">
        <div className="section-head"><h2 id="pop-h">الأكثر طلبًا</h2></div>
        <div className="grid">{popular.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      </section>

      {latest.length > 0 && (
        <section className="wrap section" aria-labelledby="new-h">
          <div className="section-head"><h2 id="new-h">وصل حديثًا</h2></div>
          <div className="row">{latest.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section>
      )}
    </>
  );
}
