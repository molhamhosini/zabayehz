'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type User = { id: number; name: string; phone: string } | null;
type Ctx = { user: User; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/me', { cache: 'no-store' });
      setUser((await r.json()).user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <UserContext.Provider value={{ user, loading, refresh, logout }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const c = useContext(UserContext);
  if (!c) throw new Error('useUser outside UserProvider');
  return c;
}

/** POST JSON to one of the site's own /api routes and throw the Arabic error message on failure. */
export async function postJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'حدث خطأ، حاول مرة أخرى');
  return data as T;
}
