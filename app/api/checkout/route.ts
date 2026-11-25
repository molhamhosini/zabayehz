import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/backend';
import { checkoutOptions } from '@/lib/account';

export async function GET() {
  try {
    return NextResponse.json(await checkoutOptions());
  } catch (e) {
    return errorResponse(e);
  }
}
