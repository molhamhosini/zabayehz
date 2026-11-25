'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { useI18n } from './LangProvider';
import { CartIcon } from './icons';

export function CartButton() {
  const { count, ready } = useCart();
  const { t, href } = useI18n();
  return (
    <Link href={href('/cart')} className="cart-btn" aria-label={t.cartLabel(count)}>
      <CartIcon size={22} />
      {ready && count > 0 && <span className="badge num">{count}</span>}
    </Link>
  );
}
