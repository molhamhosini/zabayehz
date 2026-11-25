import type { Metadata } from 'next';
import { AccountHome } from '@/components/Account';

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <AccountHome />;
}
