import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInfoPage, PAGE_FIELDS } from '@/lib/api';
import { alternates, pageLang } from '@/lib/i18n';
import { tools } from '@/lib/t';

export const revalidate = 600;

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = await pageLang(params);
  const { slug } = await params;
  const title = tools(lang).t.pages[slug];
  return title ? { title, alternates: alternates(lang, `/info/${slug}`) } : {};
}

export default async function InfoPage({ params }: Props) {
  const lang = await pageLang(params);
  const { slug } = await params;
  const { t, href } = tools(lang);
  if (!PAGE_FIELDS[slug]) notFound();
  const page = await getInfoPage(slug, lang);
  if (!page) notFound();
  return (
    <div className="wrap narrow info-page">
      <nav className="crumbs" aria-label={t.breadcrumbs}><Link href={href('/')}>{t.home}</Link><span>/</span><span>{t.pages[slug]}</span></nav>
      {page.image && <img className="info-hero" src={page.image} alt="" />}
      {/* Content written by the store in the admin panel (cleaned of scripts in lib/api.ts). */}
      <article className="panel prose" dir="auto" dangerouslySetInnerHTML={{ __html: page.html }} />
    </div>
  );
}
