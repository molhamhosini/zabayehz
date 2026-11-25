'use client';
import { usePathname } from 'next/navigation';
import { useI18n } from './LangProvider';

/** Links to the same page in the other language (keeps the query, e.g. ?q= on search). */
export function LangSwitch() {
  const { lang, t } = useI18n();
  const path = usePathname() || '/';
  const bare = path === '/en' ? '/' : path.startsWith('/en/') ? path.slice(3) : path;
  const target = lang === 'ar' ? (bare === '/' ? '/en' : `/en${bare}`) : bare;
  return (
    <a
      className="lang-btn"
      href={target}
      hrefLang={lang === 'ar' ? 'en' : 'ar'}
      lang={lang === 'ar' ? 'en' : 'ar'}
      aria-label={t.switchLangLabel}
      onClick={(e) => { e.preventDefault(); window.location.href = target + window.location.search; }}
    >
      {t.switchLang}
    </a>
  );
}
