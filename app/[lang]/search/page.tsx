import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, searchProducts } from '@/lib/api';
import { pageLang } from '@/lib/i18n';
import { tools } from '@/lib/t';

type Props = { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: tools(await pageLang(params)).t.searchTitle, robots: { index: false } };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const lang = await pageLang(params);
  const { t, href } = tools(lang);
  const q = ((await searchParams).q ?? '').slice(0, 80);
  const [results, cats] = await Promise.all([searchProducts(q, lang), getCategories(lang)]);
  return (
    <div className="wrap">
      <nav className="crumbs" aria-label={t.breadcrumbs}><Link href={href('/')}>{t.home}</Link><span>/</span><span>{t.searchTitle}</span></nav>
      <h1 className="page-title">{q ? t.resultsFor(q) : t.searchTitle}</h1>
      <p className="page-sub">{q ? <><span className="amt">{results.length}</span> {t.results}</> : t.searchHint}</p>
      {results.length > 0 ? (
        <div className="grid">{results.map((p) => <ProductCard key={p.id} p={p} lang={lang} />)}</div>
      ) : (
        q && (
          <div className="empty">
            <b>{t.noResults(q)}</b>
            {t.noResultsHint}
            <div className="chips" style={{ justifyContent: 'center', marginTop: 12 }}>
              {cats.map((c) => <Link key={c.id} href={href(`/category/${c.id}`)}>{c.name}</Link>)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
