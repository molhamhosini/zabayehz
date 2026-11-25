'use client';
import Link from 'next/link';
import { useI18n } from './LangProvider';
import { useUser } from './UserProvider';

export function AccountButton() {
  const { user, loading } = useUser();
  const { t, href } = useI18n();
  return (
    <Link href={href('/login')} className="acct-btn" aria-label={user ? t.account(user.name) : t.signIn}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
      <span className="acct-label">{loading ? '' : user ? user.name.split(' ')[0] : t.signInShort}</span>
    </Link>
  );
}
