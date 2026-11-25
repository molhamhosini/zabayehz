'use client';
import Image from 'next/image';
import { useState } from 'react';

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gallery"><div className="main" /></div>;
  return (
    <div className="gallery">
      <div className="main" style={{ position: 'relative' }}>
        <Image src={images[i]} alt={alt} fill priority sizes="(max-width: 900px) 100vw, 580px" />
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, k) => (
            <button key={src} aria-pressed={k === i} onClick={() => setI(k)} aria-label={`الصورة ${k + 1}`} style={{ position: 'relative' }}>
              <Image src={src} alt="" fill sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
