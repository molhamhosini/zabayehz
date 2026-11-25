import { NextResponse } from 'next/server';
import { badRequest, errorResponse, normalizePhone, setTokenCookie } from '@/lib/backend';
import { verifyOtp } from '@/lib/account';

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();
    const p = normalizePhone(String(phone ?? ''));
    const c = String(code ?? '').replace(/\D/g, '');
    if (!p || c.length < 4) return badRequest('أدخل رمز التحقق');
    const r = await verifyOtp(p, c);
    if (r.temporary) return NextResponse.json({ needsName: true });
    const res = NextResponse.json({ ok: true });
    setTokenCookie(res, r.token!);
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
