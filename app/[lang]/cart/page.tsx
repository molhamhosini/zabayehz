import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';
import { pageLang } from '@/lib/i18n';
import { tools } from '@/lib/t';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: tools(await pageLang(params)).t.cart, robots: { index: false } };
}

export default async function CartPage({ params }: Props) {
  const { t } = tools(await pageLang(params));
  return (
    <div className="wrap">
      <h1 className="page-title" style={{ marginTop: 20 }}>{t.cart}</h1>
      <CartView />
    </div>
  );
}
