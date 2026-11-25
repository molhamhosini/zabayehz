import { NextResponse } from 'next/server';
import { badRequest, errorResponse } from '@/lib/backend';
import { getOrder } from '@/lib/account';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) return badRequest('الطلب غير موجود');
    return NextResponse.json({ order: await getOrder(id) });
  } catch (e) {
    return errorResponse(e);
  }
}
