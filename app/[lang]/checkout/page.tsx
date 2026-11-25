import type { Metadata } from 'next';
import { Checkout } from '@/components/Checkout';
import { pageLang } from '@/lib/i18n';
import { tools } from '@/lib/t';

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: tools(await pageLang(params)).t.checkout, robots: { index: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const { t } = tools(await pageLang(params));
  return (
    <div className="wrap">
      <h1 className="page-title" style={{ marginTop: 20 }}>{t.checkout}</h1>
      <Checkout />
    </div>
  );
}
