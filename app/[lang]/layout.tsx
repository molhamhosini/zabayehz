import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import '@fontsource/ibm-plex-sans-arabic/latin-400.css';
import '@fontsource/ibm-plex-sans-arabic/latin-500.css';
import '@fontsource/ibm-plex-sans-arabic/latin-600.css';
import '@fontsource/ibm-plex-sans-arabic/latin-700.css';
import '../globals.css';
import { CartProvider } from '@/components/CartProvider';
import { UserProvider } from '@/components/UserProvider';
import { LangProvider } from '@/components/LangProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getCategories, getConfig } from '@/lib/api';
import { alternates, dictOf, dirOf, isLang, LANGS } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import { WhatsIcon } from '@/components/icons';

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = dictOf(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${t.siteName} | ${t.tagline}`, template: `%s | ${t.siteName}` },
    description: t.siteDesc,
    applicationName: t.siteName,
    openGraph: { type: 'website', locale: t.ogLocale, siteName: t.siteName, url: SITE_URL, description: t.siteDesc },
    alternates: alternates(lang, '/'),
  };
}

export const viewport: Viewport = { themeColor: '#1d5a33', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const [cfg, categories] = await Promise.all([getConfig(), getCategories(lang)]);
  const wa = String(cfg.whatsapp?.status) === '1' && cfg.whatsapp?.number ? cfg.whatsapp.number.replace(/\D/g, '') : null;
  return (
    <html lang={lang} dir={dirOf(lang)}>
      <body>
        <LangProvider lang={lang}>
        <UserProvider>
        <CartProvider>
          <Header lang={lang} categories={categories} />
          <main>{children}</main>
          <Footer lang={lang} cfg={cfg} categories={categories} />
          {wa && (
            <a className="wa-float" href={`https://wa.me/${wa}`} target="_blank" rel="noopener" aria-label={dictOf(lang).whatsapp}>
              <WhatsIcon />
            </a>
          )}
        </CartProvider>
        </UserProvider>
        </LangProvider>
      </body>
    </html>
  );
}
