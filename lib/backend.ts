// Server-only helpers for calls that need the customer's login token.
// The token lives in an httpOnly cookie, so it never reaches page JavaScript.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isLang, LANG_COOKIE, serverMsg, type Lang } from './i18n';

export const API = (process.env.API_BASE_URL || 'https://poszabayeh.com').replace(/\/$/, '');
export const MOCK = process.env.MOCK_API === '1';
export const TOKEN_COOKIE = 'zj_token';

export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Pulls a readable message out of the backend's `{errors:[{code,message}]}` shape. */
function messageOf(body: unknown, fallback: string): string {
  const b = body as { errors?: { message?: string }[]; message?: string } | null;
  return b?.errors?.[0]?.message || b?.message || fallback;
}

/** The visitor's language, set by middleware.ts when a page is opened. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : 'ar';
}

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(TOKEN_COOKIE)?.value ?? null;
}

export async function backend<T = unknown>(
  path: string,
  init: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-localization': await getLang(),
  };
  if (init.body !== undefined) headers['Content-Type'] = 'application/json';
  if (init.auth) {
    const t = await getToken();
    if (!t) throw new BackendError(401, 'يرجى تسجيل الدخول أولًا');
    headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API}/api/v1/${path}`, {
    method: init.method ?? (init.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const text = await res.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) throw new BackendError(res.status, messageOf(data, `تعذّر الاتصال بالخادم (${res.status})`));
  return data as T;
}

export function setTokenCookie(res: NextResponse, token: string) {
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 60,
  });
}

/** Turns any thrown error into a JSON error response for route handlers. */
export async function errorResponse(e: unknown) {
  const lang = await getLang();
  if (e instanceof BackendError) {
    const res = NextResponse.json({ error: serverMsg(lang, e.message) }, { status: e.status === 401 ? 401 : 400 });
    if (e.status === 401) res.cookies.delete(TOKEN_COOKIE);
    return res;
  }
  console.error(e);
  return NextResponse.json({ error: serverMsg(lang, 'حدث خطأ غير متوقع، حاول مرة أخرى') }, { status: 500 });
}

/** 400 response with a message in the visitor's language. */
export async function badRequest(msg: string) {
  return NextResponse.json({ error: serverMsg(await getLang(), msg) }, { status: 400 });
}

/** UAE numbers: accepts 05XXXXXXXX, 5XXXXXXXX, 9715…, +9715… and returns +9715XXXXXXXX. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/[^\d+]/g, '').replace(/^\+/, '');
  d = d.replace(/^00/, '');
  if (d.startsWith('971')) d = d.slice(3);
  d = d.replace(/^0/, '');
  if (!/^5\d{8}$/.test(d)) return null;
  return `+971${d}`;
}
