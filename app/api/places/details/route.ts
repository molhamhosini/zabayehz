import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/backend';
import { placeLocation } from '@/lib/account';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[\w-]{3,300}$/.test(id)) return NextResponse.json({ error: 'موقع غير صالح' }, { status: 400 });
  try {
    return NextResponse.json(await placeLocation(id));
  } catch (e) {
    return errorResponse(e);
  }
}
