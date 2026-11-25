import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrderDetails } from '@/components/Account';

export const metadata: Metadata = { robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <OrderDetails id={id} />;
}
