import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as Card } from '@/lib/types';
import { formatPrice } from '@/lib/price';
import { StarIcon } from './icons';

export function ProductCard({ p, priority = false }: { p: Card; priority?: boolean }) {
  const off = p.finalPrice < p.price ? Math.round(((p.price - p.finalPrice) / p.price) * 100) : 0;
  return (
    <Link href={`/product/${p.id}`} className="card">
      <div className="media">
        {p.image && (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, 260px" priority={priority} />
        )}
        {off > 0 && <span className="off">خصم <span className="num">{off}%</span></span>}
      </div>
      <div className="body">
        <h3>{p.name}</h3>
        <div className="meta">
          <span>السعر لكل {p.unit}</span>
          {p.rating && (
            <span className="stars" aria-label={`التقييم ${p.rating} من 5`}>
              <StarIcon /> <span className="num">{p.rating}</span>
            </span>
          )}
        </div>
        <div className="price">
          <span className="from">يبدأ من</span>
          <span className="now amt">{formatPrice(p.finalPrice)}</span>
          {off > 0 && <span className="was amt">{formatPrice(p.price)}</span>}
        </div>
      </div>
    </Link>
  );
}
