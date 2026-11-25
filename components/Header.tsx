import Link from 'next/link';
import { CartButton } from './CartButton';
import { AccountButton } from './AccountButton';
import { LangSwitch } from './LangSwitch';
import { PhoneIcon, SearchIcon } from './icons';
import { CONTACT, telHref } from '@/lib/site';
import type { Lang } from '@/lib/i18n';
import { tools } from '@/lib/t';

type Props = { lang: Lang; categories: { id: number; name: string }[]; q?: string };

export function Header({ lang, categories, q }: Props) {
  const { t, href } = tools(lang);
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <div className="perks">
            {t.perks.map((x) => <span key={x}>{x}</span>)}
          </div>
          <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
            <PhoneIcon size={15} />
            {CONTACT.phones.map((n, i) => (
              <a key={n} href={telHref(n)} className={`num${i > 0 ? ' hide-sm' : ''}`}>{n}</a>
            ))}
            <LangSwitch />
          </div>
        </div>
      </div>
      <header className="header">
        <div className="wrap">
          <Link href={href('/')} className="logo" aria-label={t.homeLabel}>
            <img src="/logo.png" alt={t.siteName} width={132} height={42} />
          </Link>
          <nav className="nav" aria-label={t.categories}>
            {categories.map((c) => (
              <Link key={c.id} href={href(`/category/${c.id}`)}>{c.name}</Link>
            ))}
          </nav>
          <span className="spacer" />
          <form className="search" action={href('/search')} role="search">
            <label htmlFor="q" className="sr-only">{t.searchLabel}</label>
            <input id="q" name="q" type="search" placeholder={t.searchPlaceholder} defaultValue={q} enterKeyHint="search" />
            <button type="submit" aria-label={t.search}><SearchIcon size={18} /></button>
          </form>
          <AccountButton />
          <CartButton />
        </div>
      </header>
    </>
  );
}
