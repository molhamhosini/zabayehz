import { NextResponse, type NextRequest } from 'next/server';
import { LANG_COOKIE, type Lang } from './lib/i18n';

// Arabic pages live at the root (/product/1) and are served from app/[lang] with lang=ar.
// English pages live under /en. The language is also kept in a cookie so the /api routes
// can answer in the visitor's language.
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || '/';
    return NextResponse.redirect(url, 308);
  }

  let lang: Lang = 'ar';
  let res: NextResponse;
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    lang = 'en';
    res = NextResponse.next();
  } else {
    const url = req.nextUrl.clone();
    url.pathname = `/ar${pathname === '/' ? '' : pathname}`;
    url.search = search;
    res = NextResponse.rewrite(url);
  }
  if (req.cookies.get(LANG_COOKIE)?.value !== lang) {
    res.cookies.set(LANG_COOKIE, lang, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

export const config = {
  // Pages only: skip the API, Next.js internals and files with an extension (images, robots.txt, sitemap.xml).
  matcher: ['/((?!api/|_next/|.*\\..*).*)'],
};
