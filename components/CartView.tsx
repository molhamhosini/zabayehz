'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/price';

export function CartView() {
  const { lines, total, setQty, remove, ready } = useCart();
  if (!ready) return null;
  if (!lines.length)
    return (
      <div className="empty" style={{ marginTop: 16 }}>
        <b>سلتك فارغة</b>
        <Link href="/" style={{ color: 'var(--brand)', fontWeight: 600 }}>تصفّح الذبائح</Link>
      </div>
    );
  return (
    <>
      <div className="cart-list" style={{ marginTop: 16 }}>
        {lines.map((l) => (
          <div key={l.key} className="cart-item">
            {l.image ? <img src={l.image} alt="" /> : <span />}
            <div>
              <Link href={`/product/${l.productId}`}><b>{l.name}</b></Link>
              <div className="opts">{l.options.map((o) => `${o.title}: ${o.value}`).join(' · ')}</div>
              <button className="rm" onClick={() => remove(l.key)}>حذف</button>
            </div>
            <div className="end">
              <div className="qty" role="group" aria-label="الكمية">
                <button onClick={() => setQty(l.key, l.qty + 1)} aria-label="زيادة">+</button>
                <output className="amt">{l.qty}</output>
                <button onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1} aria-label="إنقاص">−</button>
              </div>
              <div className="amt" style={{ fontWeight: 700, marginTop: 6, textAlign: 'center' }}>{formatPrice(l.unitPrice * l.qty)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-sum">
        <div className="line"><span>المجموع</span><span className="amt">{formatPrice(total)}</span></div>
        <div className="notice">إتمام الطلب من الموقع قيد التجهيز (المرحلة الثانية). حاليًا يمكنك إكمال الطلب من تطبيق ذبائح الجزيرة.</div>
      </div>
    </>
  );
}
