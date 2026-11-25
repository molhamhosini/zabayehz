'use client';
import Link from 'next/link';
import { useUser } from './UserProvider';

export function AccountButton() {
  const { user, loading } = useUser();
  return (
    <Link href="/login" className="acct-btn" aria-label={user ? `حسابي: ${user.name}` : 'تسجيل الدخول'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
      <span className="acct-label">{loading ? '' : user ? user.name.split(' ')[0] : 'دخول'}</span>
    </Link>
  );
}
