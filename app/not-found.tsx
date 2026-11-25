import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '60px 16px' }}>
      <div className="empty"><b>الصفحة غير موجودة</b><Link href="/" style={{ color: 'var(--brand)', fontWeight: 600 }}>العودة للرئيسية</Link></div>
    </div>
  );
}
