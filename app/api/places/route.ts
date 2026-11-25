import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/backend';
import { placeSuggestions } from '@/lib/account';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim().slice(0, 80) ?? '';
  if (q.length < 2) return NextResponse.json({ places: [] });
  try {
    return NextResponse.json({ places: await placeSuggestions(q) });
  } catch (e) {
    return errorResponse(e);
  }
}
