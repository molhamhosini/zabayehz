'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { useUser } from '@/components/UserProvider';

function Inner() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const { user, loading, logout } = useUser();
  useEffect(() => { if (!loading && user && next) router.replace(safeNext); }, [loading, user, next, safeNext, router]);
  return (
    <div className="wrap narrow">
      <h1 className="page-title" style={{ marginTop: 24 }}>{user ? 'حسابي' : 'تسجيل الدخول'}</h1>
      <div className="panel">
        {loading ? null : user ? (
          <>
            <p>مرحبًا <b>{user.name}</b></p>
            <p className="hint num">{user.phone}</p>
            <button className="btn secondary" onClick={logout}>تسجيل الخروج</button>
          </>
        ) : (
          <LoginForm onDone={() => router.replace(safeNext)} />
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Inner /></Suspense>;
}
