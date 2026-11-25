import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, searchProducts } from '@/lib/api';

export const metadata: Metadata = { title: 'البحث', robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? '').slice(0, 80);
  const [results, cats] = await Promise.all([searchProducts(q), getCategories()]);
  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span>/</span><span>البحث</span></nav>
      <h1 className="page-title">{q ? <>نتائج البحث عن «{q}»</> : 'البحث'}</h1>
      <p className="page-sub">{q ? <><span className="amt">{results.length}</span> نتيجة</> : 'اكتب اسم المنتج في خانة البحث بالأعلى.'}</p>
      {results.length > 0 ? (
        <div className="grid">{results.map((p) => <ProductCard key={p.id} p={p} />)}</div>
      ) : (
        q && (
          <div className="empty">
            <b>لم نجد منتجات تطابق «{q}»</b>
            جرّب كلمة أخرى، أو تصفّح الأقسام:
            <div className="chips" style={{ justifyContent: 'center', marginTop: 12 }}>
              {cats.map((c) => <Link key={c.id} href={`/category/${c.id}`}>{c.name}</Link>)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
