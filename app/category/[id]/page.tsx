import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { getCategories, getCategoryProducts } from '@/lib/api';

export const revalidate = 120;

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ sort?: string }> };

async function load(idStr: string) {
  const id = Number(idStr);
  if (!Number.isInteger(id)) return null;
  const cats = await getCategories();
  const cat = cats.find((c) => c.id === id);
  return cat ? { id, cat, cats } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await load((await params).id);
  if (!r) return {};
  return {
    title: r.cat.name,
    description: `تسوّق ${r.cat.name} من ذبائح الجزيرة: ذبح يومي، تقطيع حسب طلبك، وتوصيل مبرّد.`,
    alternates: { canonical: `/category/${r.id}` },
  };
}

const SORTS: Record<string, string> = { '': 'المقترح', low: 'الأقل سعرًا', high: 'الأعلى سعرًا' };

export default async function CategoryPage({ params, searchParams }: Props) {
  const r = await load((await params).id);
  if (!r) notFound();
  const sort = (await searchParams).sort ?? '';
  let products = await getCategoryProducts(r.id);
  if (sort === 'low') products = [...products].sort((a, b) => a.finalPrice - b.finalPrice);
  if (sort === 'high') products = [...products].sort((a, b) => b.finalPrice - a.finalPrice);

  return (
    <div className="wrap">
      <nav className="crumbs" aria-label="مسار التنقل"><Link href="/">الرئيسية</Link><span>/</span><span>{r.cat.name}</span></nav>
      <h1 className="page-title">{r.cat.name}</h1>
      <p className="page-sub"><span className="amt">{products.length}</span> منتج</p>
      <nav className="chips" aria-label="الأقسام">
        {r.cats.map((c) => (
          <Link key={c.id} href={`/category/${c.id}`} aria-current={c.id === r.id ? 'page' : undefined}>{c.name}</Link>
        ))}
      </nav>
      <nav className="chips" aria-label="الترتيب">
        {Object.entries(SORTS).map(([k, label]) => (
          <Link key={k} href={k ? `?sort=${k}` : `/category/${r.id}`} aria-current={sort === k ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      {products.length ? (
        <div className="grid">{products.map((p, i) => <ProductCard key={p.id} p={p} priority={i < 4} />)}</div>
      ) : (
        <div className="empty"><b>لا توجد منتجات في هذا القسم حاليًا</b>جرّب قسمًا آخر أو عُد لاحقًا.</div>
      )}
    </div>
  );
}
