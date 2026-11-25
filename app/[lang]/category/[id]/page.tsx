import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getCategoryProducts } from '@/lib/api';
import { alternates, pageLang, type Lang } from '@/lib/i18n';
import { tools } from '@/lib/t';

export const revalidate = 120;

type Props = { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ sort?: string }> };

async function load(lang: Lang, idStr: string) {
  const id = Number(idStr);
  if (!Number.isInteger(id)) return null;
  const cats = await getCategories(lang);
  const cat = cats.find((c) => c.id === id);
  return cat ? { id, cat, cats } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = await pageLang(params);
  const r = await load(lang, (await params).id);
  if (!r) return {};
  return {
    title: r.cat.name,
    description: tools(lang).t.categoryDesc(r.cat.name),
    alternates: alternates(lang, `/category/${r.id}`),
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const lang = await pageLang(params);
  const { t, href } = tools(lang);
  const r = await load(lang, (await params).id);
  if (!r) notFound();
  const sort = (await searchParams).sort ?? '';
  let products = await getCategoryProducts(r.id, lang);
  if (sort === 'low') products = [...products].sort((a, b) => a.finalPrice - b.finalPrice);
  if (sort === 'high') products = [...products].sort((a, b) => b.finalPrice - a.finalPrice);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label={t.breadcrumbs}><Link href={href('/')}>{t.home}</Link><span>/</span><span>{r.cat.name}</span></nav>
      <h1 className="page-title">{r.cat.name}</h1>
      <p className="page-sub"><span className="amt">{products.length}</span> {t.productsCount}</p>
      <nav className="chips" aria-label={t.categories}>
        {r.cats.map((c) => (
          <Link key={c.id} href={href(`/category/${c.id}`)} aria-current={c.id === r.id ? 'page' : undefined}>{c.name}</Link>
        ))}
      </nav>
      <nav className="chips" aria-label={t.sortLabel}>
        {Object.entries(t.sorts).map(([k, label]) => (
          <Link key={k} href={k ? `?sort=${k}` : href(`/category/${r.id}`)} aria-current={sort === k ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      {products.length ? (
        <div className="grid">{products.map((p, i) => <ProductCard key={p.id} p={p} lang={lang} priority={i < 4} />)}</div>
      ) : (
        <div className="empty"><b>{t.emptyCategory}</b>{t.emptyCategoryHint}</div>
      )}
    </div>
  );
}
