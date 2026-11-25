import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/backend';
import { reverseGeocode } from '@/lib/account';

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const lat = Number(u.get('lat')), lng = Number(u.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ error: 'موقع غير صالح' }, { status: 400 });
  try {
    return NextResponse.json({ address: await reverseGeocode(lat, lng) });
  } catch (e) {
    return errorResponse(e);
  }
}
