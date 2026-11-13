import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, local } from './api';
import type { Lang, Meta, Profile } from './types';

export type Page = 'home' | 'ask' | 'mandi' | 'weather' | 'schemes' | 'learn' | 'profile' | 'experts' | 'crop';

interface AppState {
  page: Page;
  go(p: Page, opts?: { autoListen?: boolean; prompt?: string }): void;
  navOpts: { autoListen?: boolean; prompt?: string };
  lang: Lang;
  setLang(l: Lang): void;
  profile: Profile;
  saveProfile(p: Profile): void;
  clearProfile(): void;
  meta: Meta | null;
  online: boolean;
  speechRate: number;
  setSpeechRate(r: number): void;
}

const DEFAULT_PROFILE: Profile = { preferredLang: 'bho', crops: [], syncToServer: false };
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [navOpts, setNavOpts] = useState<AppState['navOpts']>({});
  const [profile, setProfile] = useState<Profile>(() => local.get('bfa.profile', DEFAULT_PROFILE));
  const [lang, setLangState] = useState<Lang>(() => local.get<Profile>('bfa.profile', DEFAULT_PROFILE).preferredLang);
  const [meta, setMeta] = useState<Meta | null>(() => local.get<Meta | null>('bfa.meta', null));
  const [online, setOnline] = useState(navigator.onLine);
  const [speechRate, setRate] = useState<number>(() => local.get('bfa.rate', 0.9));

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    api.get<Meta>('/api/meta').then((m) => { setMeta(m); local.set('bfa.meta', m); }).catch(() => undefined);
  }, [online]);

  const value = useMemo<AppState>(() => ({
    page,
    navOpts,
    go: (p, opts = {}) => { setNavOpts(opts); setPage(p); window.scrollTo(0, 0); },
    lang,
    setLang: (l) => { setLangState(l); const np = { ...profile, preferredLang: l }; setProfile(np); local.set('bfa.profile', np); },
    profile,
    saveProfile: (p) => { setProfile(p); local.set('bfa.profile', p); setLangState(p.preferredLang); },
    clearProfile: () => { local.remove('bfa.profile'); local.remove('bfa.chat'); local.remove('bfa.mandi'); setProfile(DEFAULT_PROFILE); },
    meta,
    online,
    speechRate,
    setSpeechRate: (r) => { setRate(r); local.set('bfa.rate', r); },
  }), [page, navOpts, lang, profile, meta, online, speechRate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}

/** Bilingual label helper: Hindi UI text with a Bhojpuri variant where it matters. */
export const tr = (lang: Lang, hi: string, bho: string) => (lang === 'bho' ? bho : hi);

export function districtName(meta: Meta | null, id?: string) {
  return meta?.districts.find((d) => d.id === id)?.nameHi ?? '';
}
export function cropName(meta: Meta | null, id?: string, lang: Lang = 'hi') {
  const c = meta?.crops.find((x) => x.id === id);
  return c ? (lang === 'bho' ? c.nameBho : c.nameHi) : '';
}
