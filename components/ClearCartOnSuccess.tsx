'use client';
import { useEffect } from 'react';
import { useCart } from './CartProvider';

export function ClearCartOnSuccess() {
  const { clear, ready } = useCart();
  useEffect(() => { if (ready) clear(); }, [ready, clear]);
  return null;
}
