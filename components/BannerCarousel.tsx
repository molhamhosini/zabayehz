'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useI18n } from './LangProvider';

type Banner = { id: number; title: string; image: string; href: string | null };

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(items.indexOf(e.target as HTMLElement))),
      { root: el, threshold: 0.6 },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [banners.length]);

  // Gentle autoplay; stops when the visitor interacts or prefers reduced motion.
  useEffect(() => {
    const el = ref.current;
    if (!el || banners.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stopped = false;
    const stop = () => (stopped = true);
    el.addEventListener('pointerdown', stop, { once: true });
    el.addEventListener('wheel', stop, { once: true });
    const t = setInterval(() => {
      if (stopped || document.hidden) return;
      const items = el.children;
      const next = (active + 1) % items.length;
      (items[next] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }, 5000);
    return () => clearInterval(t);
  }, [active, banners.length]);

  const go = (i: number) =>
    (ref.current?.children[i] as HTMLElement | undefined)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

  return (
    <div>
      <div className="banners" ref={ref} aria-roledescription="carousel" aria-label={t.bannersLabel}>
        {banners.map((b, i) => {
          const img = (
            <Image src={b.image} alt={b.title || t.bannerAlt} fill priority={i === 0} sizes="(max-width: 900px) 100vw, 600px" />
          );
          return b.href ? (
            <Link key={b.id} href={b.href} className="banner">{img}</Link>
          ) : (
            <div key={b.id} className="banner">{img}</div>
          );
        })}
      </div>
      {banners.length > 1 && (
        <div className="dots">
          {banners.map((b, i) => (
            <button key={b.id} aria-label={t.bannerN(i + 1)} aria-current={i === active} onClick={() => go(i)} />
          ))}
        </div>
      )}
    </div>
  );
}
