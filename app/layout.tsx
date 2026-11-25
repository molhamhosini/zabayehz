import type { Metadata, Viewport } from 'next';
import '@fontsource/ibm-plex-sans-arabic/arabic-400.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-500.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-600.css';
import '@fontsource/ibm-plex-sans-arabic/arabic-700.css';
import '@fontsource/ibm-plex-sans-arabic/latin-400.css';
import '@fontsource/ibm-plex-sans-arabic/latin-700.css';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import { UserProvider } from '@/components/UserProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getCategories, getConfig } from '@/lib/api';
import { SITE_DESC, SITE_NAME, SITE_URL } from '@/lib/site';
import { WhatsIcon } from '@/components/icons';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ذبائح طازجة توصل لبيتك`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  openGraph: { type: 'website', locale: 'ar_AE', siteName: SITE_NAME, url: SITE_URL, description: SITE_DESC },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#1d5a33', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cfg, categories] = await Promise.all([getConfig(), getCategories()]);
  const wa = String(cfg.whatsapp?.status) === '1' && cfg.whatsapp?.number ? cfg.whatsapp.number.replace(/\D/g, '') : null;
  return (
    <html lang="ar" dir="rtl">
      <body>
        <UserProvider>
        <CartProvider>
          <Header categories={categories} />
          <main>{children}</main>
          <Footer cfg={cfg} categories={categories} />
          {wa && (
            <a className="wa-float" href={`https://wa.me/${wa}`} target="_blank" rel="noopener" aria-label="تواصل عبر واتساب">
              <WhatsIcon />
            </a>
          )}
        </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
