import { NextResponse } from 'next/server';
import { errorResponse, normalizePhone } from '@/lib/backend';
import { sendOtp } from '@/lib/account';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const p = normalizePhone(String(phone ?? ''));
    if (!p) return NextResponse.json({ error: 'أدخل رقم جوال إماراتي صحيح، مثل 05XXXXXXXX' }, { status: 400 });
    await sendOtp(p);
    return NextResponse.json({ phone: p });
  } catch (e) {
    return errorResponse(e);
  }
}
