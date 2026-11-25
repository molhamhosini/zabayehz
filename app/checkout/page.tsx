import type { Metadata } from 'next';
import { Checkout } from '@/components/Checkout';

export const metadata: Metadata = { title: 'إتمام الطلب', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="wrap">
      <h1 className="page-title" style={{ marginTop: 20 }}>إتمام الطلب</h1>
      <Checkout />
    </div>
  );
}
