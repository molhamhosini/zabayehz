import Link from 'next/link';
import { CartButton } from './CartButton';
import { PhoneIcon, SearchIcon } from './icons';

type Props = { phone?: string; categories: { id: number; name: string }[]; q?: string };

export function Header({ phone, categories, q }: Props) {
  return (
    <>
      <div className="topbar">
        <div className="wrap">
          <div className="perks">
            <span>ذبح يومي وفق الشريعة</span>
            <span>إشراف بيطري كامل</span>
            <span>توصيل مبرّد</span>
          </div>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <PhoneIcon size={15} /> <span className="num">{phone}</span>
            </a>
          )}
        </div>
      </div>
      <header className="header">
        <div className="wrap">
          <Link href="/" className="logo" aria-label="ذبائح الجزيرة، الصفحة الرئيسية">
            <img src="/logo.png" alt="ذبائح الجزيرة" width={132} height={42} />
          </Link>
          <nav className="nav" aria-label="الأقسام">
            {categories.map((c) => (
              <Link key={c.id} href={`/category/${c.id}`}>{c.name}</Link>
            ))}
          </nav>
          <span className="spacer" />
          <form className="search" action="/search" role="search">
            <label htmlFor="q" className="sr-only">ابحث عن منتج</label>
            <input id="q" name="q" type="search" placeholder="ابحث: خروف نعيمي، تيس، نصف ذبيحة…" defaultValue={q} enterKeyHint="search" />
            <button type="submit" aria-label="بحث"><SearchIcon size={18} /></button>
          </form>
          <CartButton />
        </div>
      </header>
    </>
  );
}
