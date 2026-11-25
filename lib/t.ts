import { dictOf, href, optLabel, type Lang } from './i18n';
import { formatPrice } from './price';

/** Everything a page needs to render in one language. Works in server and client components. */
export function tools(lang: Lang) {
  return {
    lang,
    t: dictOf(lang),
    href: (path: string) => href(lang, path),
    price: (n: number) => formatPrice(n, lang),
    opt: (s: string) => optLabel(lang, s),
  };
}
export type Tools = ReturnType<typeof tools>;
