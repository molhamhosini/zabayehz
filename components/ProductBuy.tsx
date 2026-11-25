'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ProductDetail } from '@/lib/types';
import { finalPrice } from '@/lib/price';
import { variantKey } from '@/lib/variant';
import { useCart } from './CartProvider';
import { CheckIcon } from './icons';
import { useI18n } from './LangProvider';

export function ProductBuy({ p }: { p: ProductDetail }) {
  const { add } = useCart();
  const { t, href, price: formatPrice, opt } = useI18n();
  // Single-choice groups start on their first option so a price shows right away.
  const [picked, setPicked] = useState<(number | null)[]>(() =>
    p.choices.map((c) => (c.kind !== 'multi' && c.required && c.options.length ? 0 : null)),
  );
  const [multi, setMulti] = useState<Set<number>[]>(() => p.choices.map(() => new Set()));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { base, stock } = useMemo(() => {
    const parts: string[] = [];
    p.choices.forEach((c, i) => {
      if (c.kind === 'multi') return;
      const idx = picked[i];
      if (idx !== null && idx !== undefined) parts.push(c.options[idx].label);
    });
    const hit = parts.length ? p.variants[variantKey(parts)] : undefined;
    return { base: hit ? hit[0] : p.price, stock: hit ? hit[1] : p.inStock ? 99 : 0 };
  }, [picked, p]);

  const now = finalPrice(base, p.discount);
  const missing = p.choices.findIndex((c, i) => c.kind !== 'multi' && c.required && picked[i] === null);
  const maxQty = Math.max(1, Math.min(p.maxQty, stock || 1));
  const soldOut = stock <= 0;

  function choose(i: number, j: number) {
    setAdded(false);
    setPicked((prev) => prev.map((v, k) => (k === i ? (v === j && !p.choices[i].required ? null : j) : v)));
  }
  function toggle(i: number, j: number) {
    setAdded(false);
    setMulti((prev) => prev.map((s, k) => {
      if (k !== i) return s;
      const n = new Set(s);
      n.has(j) ? n.delete(j) : n.add(j);
      return n;
    }));
  }
  function addToCart() {
    if (missing >= 0 || soldOut) return;
    const options: { title: string; value: string }[] = [];
    const selections: Record<string, string> = {};
    const multiSel: Record<string, string[]> = {};
    p.choices.forEach((c, i) => {
      if (c.kind === 'multi') {
        const vals = [...multi[i]].sort().map((j) => c.options[j].label);
        if (vals.length) {
          options.push({ title: c.title, value: vals.join('، ') });
          multiSel[c.title] = vals;
        }
      } else if (picked[i] !== null) {
        options.push({ title: c.title, value: c.options[picked[i]!].label });
        selections[c.title] = c.options[picked[i]!].label;
      }
    });
    add({
      key: `${p.id}|${options.map((o) => o.value).join('|')}`,
      productId: p.id,
      name: p.name,
      image: p.images[0] ?? p.image,
      unitPrice: now,
      qty,
      options,
      selections,
      multi: multiSel,
    });
    setAdded(true);
  }

  const buyLabel = soldOut ? t.soldOut : missing >= 0 ? t.choose(opt(p.choices[missing].title)) : t.addToCart;

  return (
    <div>
      <div className="bigprice" aria-live="polite">
        <span className="now amt" style={{ fontWeight: 700, color: 'var(--brand-deep)' }}>{formatPrice(now * qty)}</span>
        {now < base && <span className="was amt" style={{ textDecoration: 'line-through', color: 'var(--muted)' }}>{formatPrice(base * qty)}</span>}
        {now < base && <span className="save">{t.save} <span className="amt">{formatPrice((base - now) * qty)}</span></span>}
        <span className="note">{t.priceNote}{qty > 1 ? ` (${qty} × ${formatPrice(now)})` : ''}.</span>
      </div>

      {p.choices.map((c, i) => (
        <fieldset key={c.title} className="opt">
          <legend className="sr-only">{opt(c.title)}</legend>
          <div className="opt-head">
            <h2 aria-hidden>{opt(c.title)}</h2>
            {c.kind === 'multi' ? (
              <span>{t.multiHint}</span>
            ) : picked[i] !== null ? (
              <span className="chosen">{opt(c.options[picked[i]!].label)}</span>
            ) : (
              <span>{c.required ? t.required : t.optional}</span>
            )}
          </div>
          {c.kind === 'text' ? (
            <div className="pills">
              {c.options.map((o, j) => (
                <button key={o.label} type="button" className="pill" aria-pressed={picked[i] === j} onClick={() => choose(i, j)}>
                  {opt(o.label)}
                </button>
              ))}
            </div>
          ) : (
            <div className="tiles">
              {c.options.map((o, j) => {
                const on = c.kind === 'multi' ? multi[i].has(j) : picked[i] === j;
                return (
                  <button key={o.label} type="button" className="tile" aria-pressed={on} onClick={() => (c.kind === 'multi' ? toggle(i, j) : choose(i, j))}>
                    <span className="ph">
                      {o.image ? <Image src={o.image} alt="" width={120} height={120} onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")} /> : <span aria-hidden>—</span>}
                    </span>
                    {opt(o.label)}
                    <span className="tick"><CheckIcon size={13} /></span>
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>
      ))}

      <div className="buy">
        <div className="qty" role="group" aria-label={t.quantity}>
          <button type="button" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label={t.increase}>+</button>
          <output className="amt" aria-live="polite">{qty}</output>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label={t.decrease}>−</button>
        </div>
        <button type="button" className="btn" onClick={addToCart} disabled={soldOut || missing >= 0}>{buyLabel}</button>
      </div>
      {added && (
        <div className="added" role="status">
          <span>{t.added}</span>
          <Link href={href('/cart')}>{t.viewCart}</Link>
        </div>
      )}

      <div className="mobile-buy">
        <div className="p">
          <small>{t.total}</small>
          <b className="amt">{formatPrice(now * qty)}</b>
        </div>
        <button type="button" className="btn" onClick={addToCart} disabled={soldOut || missing >= 0}>{added ? t.addedShort : buyLabel}</button>
      </div>
    </div>
  );
}
