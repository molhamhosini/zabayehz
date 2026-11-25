import { NextResponse } from 'next/server';
import { badRequest, errorResponse, normalizePhone, setTokenCookie } from '@/lib/backend';
import { registerWithOtp } from '@/lib/account';

export async function POST(req: Request) {
  try {
    const { phone, name, email } = await req.json();
    const p = normalizePhone(String(phone ?? ''));
    const n = String(name ?? '').trim().slice(0, 80);
    if (!p || n.length < 2) return badRequest('اكتب اسمك');
    const token = await registerWithOtp(p, n, email ? String(email).trim() : undefined);
    const res = NextResponse.json({ ok: true });
    setTokenCookie(res, token);
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
