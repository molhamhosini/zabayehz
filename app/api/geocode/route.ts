import { NextResponse } from 'next/server';
import { badRequest, errorResponse } from '@/lib/backend';
import { reverseGeocode } from '@/lib/account';

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const lat = Number(u.get('lat')), lng = Number(u.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return badRequest('موقع غير صالح');
  try {
    return NextResponse.json({ address: await reverseGeocode(lat, lng) });
  } catch (e) {
    return errorResponse(e);
  }
}
