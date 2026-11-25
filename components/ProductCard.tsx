import Image from 'next/image';
import Link from 'next/link';
import type { ProductCard as Card } from '@/lib/types';
import type { Lang } from '@/lib/i18n';
import { tools } from '@/lib/t';
import { StarIcon } from './icons';

export function ProductCard({ p, lang, priority = false }: { p: Card; lang: Lang; priority?: boolean }) {
  const { t, href, price } = tools(lang);
  const off = p.finalPrice < p.price ? Math.round(((p.price - p.finalPrice) / p.price) * 100) : 0;
  return (
    <Link href={href(`/product/${p.id}`)} className="card">
      <div className="media">
        {p.image && (
          <Image src={p.image} alt={p.name} fill sizes="(max-width: 640px) 50vw, 260px" priority={priority} />
        )}
        {off > 0 && <span className="off">{t.off} <span className="num">{off}%</span></span>}
      </div>
      <div className="body">
        <h3>{p.name}</h3>
        <div className="meta">
          <span>{t.pricePer(t.units[p.unit] ?? p.unit)}</span>
          {p.rating && (
            <span className="stars" aria-label={t.rating(p.rating)}>
              <StarIcon /> <span className="num">{p.rating}</span>
            </span>
          )}
        </div>
        <div className="price">
          <span className="from">{t.from}</span>
          <span className="now amt">{price(p.finalPrice)}</span>
          {off > 0 && <span className="was amt">{price(p.price)}</span>}
        </div>
      </div>
    </Link>
  );
}
