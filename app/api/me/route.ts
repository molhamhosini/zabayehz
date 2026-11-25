import { NextResponse } from 'next/server';
import { badRequest, errorResponse, getToken, TOKEN_COOKIE } from '@/lib/backend';
import { getMe, removeAccount, updateProfile } from '@/lib/account';

export async function GET() {
  if (!(await getToken())) return NextResponse.json({ user: null });
  try {
    const me = await getMe();
    return NextResponse.json({
      user: {
        id: me.id,
        name: [me.f_name, me.l_name].filter(Boolean).join(' '),
        fName: me.f_name ?? '',
        lName: me.l_name ?? '',
        email: me.email ?? '',
        phone: me.phone,
      },
    });
  } catch {
    const res = NextResponse.json({ user: null });
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }
}

/** Updates the name and email. */
export async function PUT(req: Request) {
  try {
    const b = await req.json();
    const fName = String(b.fName ?? '').trim().slice(0, 60);
    const lName = String(b.lName ?? '').trim().slice(0, 60);
    const email = String(b.email ?? '').trim().slice(0, 120);
    if (fName.length < 2) return badRequest('اكتب اسمك الأول');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest('البريد الإلكتروني غير صحيح');
    await updateProfile({ fName, lName, email });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Deletes the account, then signs out. */
export async function DELETE() {
  try {
    await removeAccount();
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
