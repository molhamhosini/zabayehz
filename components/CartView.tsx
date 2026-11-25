'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { useI18n } from './LangProvider';

export function CartView() {
  const { lines, total, setQty, remove, ready } = useCart();
  const { t, href, price, opt } = useI18n();
  if (!ready) return null;
  if (!lines.length)
    return (
      <div className="empty" style={{ marginTop: 16 }}>
        <b>{t.emptyCart}</b>
        <Link href={href('/')} style={{ color: 'var(--brand)', fontWeight: 600 }}>{t.browse}</Link>
      </div>
    );
  return (
    <>
      <div className="cart-list" style={{ marginTop: 16 }}>
        {lines.map((l) => (
          <div key={l.key} className="cart-item">
            {l.image ? <img src={l.image} alt="" /> : <span />}
            <div>
              <Link href={href(`/product/${l.productId}`)}><b dir="auto">{l.name}</b></Link>
              <div className="opts">{l.options.map((o) => `${opt(o.title)}: ${optionValue(o.value, opt, t.listSep)}`).join(' · ')}</div>
              <button className="rm" onClick={() => remove(l.key)}>{t.remove}</button>
            </div>
            <div className="end">
              <div className="qty" role="group" aria-label={t.quantity}>
                <button onClick={() => setQty(l.key, l.qty + 1)} aria-label={t.increase}>+</button>
                <output className="amt">{l.qty}</output>
                <button onClick={() => setQty(l.key, l.qty - 1)} disabled={l.qty <= 1} aria-label={t.decrease}>−</button>
              </div>
              <div className="amt" style={{ fontWeight: 700, marginTop: 6, textAlign: 'center' }}>{price(l.unitPrice * l.qty)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-sum">
        <div className="line"><span>{t.subtotal}</span><span className="amt">{price(total)}</span></div>
        <Link href={href('/checkout')} className="btn">{t.checkout}</Link>
      </div>
    </>
  );
}

/** Multi-choice values are stored joined with "، "; translate each part. */
export function optionValue(v: string, opt: (s: string) => string, sep: string) {
  return v.split('، ').map(opt).join(sep);
}
