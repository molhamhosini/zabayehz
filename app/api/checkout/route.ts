import { NextResponse } from 'next/server';
import { errorResponse, getLang } from '@/lib/backend';
import { serverMsg } from '@/lib/i18n';
import { checkoutOptions } from '@/lib/account';

export async function GET() {
  try {
    const [opts, lang] = await Promise.all([checkoutOptions(), getLang()]);
    return NextResponse.json({ ...opts, payments: opts.payments.map((p) => ({ ...p, label: serverMsg(lang, p.label) })) });
  } catch (e) {
    return errorResponse(e);
  }
}
