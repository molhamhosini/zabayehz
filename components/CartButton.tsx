'use client';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { CartIcon } from './icons';

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="cart-btn" aria-label={`السلة${count ? `، ${count} منتجات` : ''}`}>
      <CartIcon size={22} />
      {ready && count > 0 && <span className="badge num">{count}</span>}
    </Link>
  );
}
