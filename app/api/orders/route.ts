import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/backend';
import { placeOrder, type OrderLineInput } from '@/lib/account';

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const lines: OrderLineInput[] = Array.isArray(b.lines)
      ? b.lines.slice(0, 50).map((l: OrderLineInput) => ({
          productId: Number(l.productId),
          qty: Number(l.qty),
          selections: typeof l.selections === 'object' && l.selections ? l.selections : {},
          multi: typeof l.multi === 'object' && l.multi ? l.multi : {},
        }))
      : [];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(b.date))) return NextResponse.json({ error: 'اختر يوم التوصيل' }, { status: 400 });
    const origin = new URL(req.url).origin;
    const r = await placeOrder({
      lines,
      addressId: Number(b.addressId),
      date: b.date,
      slotId: Number(b.slotId),
      payment: String(b.payment),
      note: b.note ? String(b.note) : '',
      origin,
    });
    return NextResponse.json(r);
  } catch (e) {
    return errorResponse(e);
  }
}
