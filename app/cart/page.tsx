import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';

export const metadata: Metadata = { title: 'السلة', robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap">
      <h1 className="page-title" style={{ marginTop: 20 }}>السلة</h1>
      <CartView />
    </div>
  );
}
