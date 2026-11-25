import type { Metadata } from 'next';
import { ProfileForm } from '@/components/Account';

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return <ProfileForm />;
}
