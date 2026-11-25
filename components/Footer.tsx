import Link from 'next/link';
import type { ApiConfig } from '@/lib/types';
import { CONTACT, telHref } from '@/lib/site';

export function Footer({ cfg, categories }: { cfg: ApiConfig; categories: { id: number; name: string }[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div className="brand">
            <img src="/logo.png" alt="ذبائح الجزيرة" width={126} height={40} />
            <p>ذبائح طازجة من مزارعنا، تُذبح يوميًا وفق الشريعة الإسلامية وتصلك مبرّدة إلى باب البيت.</p>
          </div>
          <div>
            <h3>الأقسام</h3>
            <ul>{categories.map((c) => <li key={c.id}><Link href={`/category/${c.id}`}>{c.name}</Link></li>)}</ul>
          </div>
          <div>
            <h3>تواصل معنا</h3>
            <ul>
              {CONTACT.phones.map((n) => <li key={n}><a href={telHref(n)} className="num">{n}</a></li>)}
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
              {cfg.ecommerce_address && <li>{cfg.ecommerce_address}</li>}
            </ul>
          </div>
          <div>
            <h3>حمّل التطبيق</h3>
            <div className="stores">
              {cfg.play_store_config?.status && <a href={cfg.play_store_config.link} rel="noopener" target="_blank">Google Play</a>}
              {cfg.app_store_config?.status && <a href={cfg.app_store_config.link} rel="noopener" target="_blank">App Store</a>}
            </div>
          </div>
        </div>
        <div className="copy">© {year} ذبائح الجزيرة. جميع الحقوق محفوظة.</div>
      </div>
    </footer>
  );
}
