'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { useI18n } from '@/components/LangProvider';
import { useUser } from '@/components/UserProvider';

function Inner() {
  const router = useRouter();
  const { t, href } = useI18n();
  const next = useSearchParams().get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : href('/');
  const { user, loading, logout } = useUser();
  // Signed-in customers go back where they came from, or to their account.
  useEffect(() => { if (!loading && user) router.replace(next ? safeNext : href('/account')); }, [loading, user, next, safeNext, router, href]);
  useEffect(() => { document.title = `${user ? t.myAccount : t.signIn} | ${t.siteName}`; }, [user, t]);
  return (
    <div className="wrap narrow">
      <h1 className="page-title" style={{ marginTop: 24 }}>{user ? t.myAccount : t.signIn}</h1>
      <div className="panel">
        {loading ? null : user ? (
          <>
            <p>{t.hello} <b>{user.name}</b></p>
            <p className="hint num">{user.phone}</p>
            <button className="btn secondary" onClick={logout}>{t.logout}</button>
          </>
        ) : (
          <LoginForm onDone={() => router.replace(next ? safeNext : href('/account'))} />
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Inner /></Suspense>;
}
