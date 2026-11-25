import Link from 'next/link';
import type { ApiConfig } from '@/lib/types';
import { CONTACT, telHref } from '@/lib/site';
import { hasArabic, type Lang } from '@/lib/i18n';
import { tools } from '@/lib/t';

export function Footer({ lang, cfg, categories }: { lang: Lang; cfg: ApiConfig; categories: { id: number; name: string }[] }) {
  const { t, href } = tools(lang);
  const year = new Date().getFullYear();
  const address = cfg.ecommerce_address && !(lang === 'en' && hasArabic(cfg.ecommerce_address)) ? cfg.ecommerce_address : null;
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div className="brand">
            <img src="/logo.png" alt={t.siteName} width={126} height={40} />
            <p>{t.footerAbout}</p>
          </div>
          <div>
            <h3>{t.categories}</h3>
            <ul>{categories.map((c) => <li key={c.id}><Link href={href(`/category/${c.id}`)}>{c.name}</Link></li>)}</ul>
          </div>
          <div>
            <h3>{t.contactUs}</h3>
            <ul>
              {CONTACT.phones.map((n) => <li key={n}><a href={telHref(n)} className="num">{n}</a></li>)}
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              {address && <li>{address}</li>}
            </ul>
          </div>
          <div>
            <h3>{t.getApp}</h3>
            <div className="stores">
              {cfg.play_store_config?.status && <a href={cfg.play_store_config.link} rel="noopener" target="_blank">Google Play</a>}
              {cfg.app_store_config?.status && <a href={cfg.app_store_config.link} rel="noopener" target="_blank">App Store</a>}
            </div>
          </div>
        </div>
        <div className="copy">{t.rights(year)}</div>
      </div>
    </footer>
  );
}
