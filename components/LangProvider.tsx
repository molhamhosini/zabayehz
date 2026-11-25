'use client';
import { createContext, useContext, useMemo } from 'react';
import type { Lang } from '@/lib/i18n';
import { tools } from '@/lib/t';

const LangContext = createContext<Lang>('ar');

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const lang = useContext(LangContext);
  return useMemo(() => tools(lang), [lang]);
}
