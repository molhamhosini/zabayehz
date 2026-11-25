import Link from 'next/link';
import type { ApiConfig } from '@/lib/types';
import { CONTACT, telHref } from '@/lib/site';
import type { Lang } from '@/lib/i18n';
import { tools } from '@/lib/t';

export function Footer({ lang, cfg, categories, pages }: { lang: Lang; cfg: ApiConfig; categories: { id: number; name: string }[]; pages: string[] }) {
  const { t, href } = tools(lang);
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div className="brand">
            <img src="/logo.png" alt={t.siteName} width={126} height={40} />
            <p>{t.footerAbout}</p>
            <p className="company">{t.companyOf} <b>{t.company}</b></p>
          </div>
          <div>
            <h3>{t.categories}</h3>
            <ul>{categories.map((c) => <li key={c.id}><Link href={href(`/category/${c.id}`)}>{c.name}</Link></li>)}</ul>
          </div>
          {pages.length > 0 && (
            <div>
              <h3>{t.infoLinks}</h3>
              <ul>{pages.map((p) => <li key={p}><Link href={href(`/info/${p}`)}>{t.pages[p]}</Link></li>)}</ul>
            </div>
          )}
          <div>
            <h3>{t.contactUs}</h3>
            <ul>
              {CONTACT.phones.map((n) => <li key={n}><a href={telHref(n)} className="num">{n}</a></li>)}
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              <li><address>{t.address}</address></li>
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
        <div className="copy">{t.rights(year)} · {t.company}</div>
      </div>
    </footer>
  );
}
