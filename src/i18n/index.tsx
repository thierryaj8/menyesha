import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { en } from './en';
import { fr } from './fr';
import { rw } from './rw';

export type Locale = 'en' | 'rw' | 'fr';

const LOCALE_STORAGE_KEY = 'menyesha.locale';

function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'rw' || value === 'fr';
}

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'rw', label: 'Kinyarwanda' },
  { id: 'fr', label: 'Français' },
];

const dictionaries: Record<Locale, Record<string, string>> = { en, rw, fr };

export type TranslateParams = Record<string, string | number>;

export function translate(locale: Locale, key: string, params?: TranslateParams): string {
  const template = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
}

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: TranslateParams) => string;
}

const I18nContext = createContext<I18nValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key, params) => translate('en', key, params),
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  // Restore the saved language once on startup (falls back to English).
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      .then((saved) => {
        if (!cancelled && isLocale(saved)) setLocale(saved);
      })
      .catch(() => {
        // First run or storage unavailable — English default is fine.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next);
    AsyncStorage.setItem(LOCALE_STORAGE_KEY, next).catch(() => {
      // Saving is a nice-to-have; the in-memory choice still applies.
    });
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      setLocale: changeLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, changeLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/** Shorthand for screens: const t = useT(); */
export function useT(): I18nValue['t'] {
  return useContext(I18nContext).t;
}
