import { NextResponse } from 'next/server';
import { getToken } from '@/lib/backend';
import { getMe } from '@/lib/account';
import { TOKEN_COOKIE } from '@/lib/backend';

export async function GET() {
  if (!(await getToken())) return NextResponse.json({ user: null });
  try {
    const me = await getMe();
    return NextResponse.json({ user: { id: me.id, name: [me.f_name, me.l_name].filter(Boolean).join(' '), phone: me.phone } });
  } catch {
    const res = NextResponse.json({ user: null });
    res.cookies.delete(TOKEN_COOKIE);
    return res;
  }
}
