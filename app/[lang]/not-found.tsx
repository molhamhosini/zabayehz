'use client';
import Link from 'next/link';
import { useI18n } from '@/components/LangProvider';

export default function NotFound() {
  const { t, href } = useI18n();
  return (
    <div className="wrap" style={{ padding: '60px 16px' }}>
      <div className="empty"><b>{t.notFound}</b><Link href={href('/')} style={{ color: 'var(--brand)', fontWeight: 600 }}>{t.backHome}</Link></div>
    </div>
  );
}
