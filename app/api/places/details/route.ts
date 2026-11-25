import { NextResponse } from 'next/server';
import { badRequest, errorResponse } from '@/lib/backend';
import { placeLocation } from '@/lib/account';

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? '';
  if (!/^[\w-]{3,300}$/.test(id)) return badRequest('موقع غير صالح');
  try {
    return NextResponse.json(await placeLocation(id));
  } catch (e) {
    return errorResponse(e);
  }
}
