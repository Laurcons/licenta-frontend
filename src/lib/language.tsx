import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import en from './locale/en';
import ro from './locale/ro';
import { localdb } from './dexie/dexie';

export enum Language {
  ro = 'ro',
  en = 'en',
}

interface LocaleData {
  [key: string]: string | LocaleData;
}
const locales: Record<Language, LocaleData> = { en, ro };

// type support for dot notation
// https://stackoverflow.com/questions/47057649/typescript-string-dot-notation-of-nested-object
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];
type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
  ? F
  : T extends [infer F, ...infer R]
  ? F extends string
    ? `${F}${D}${Join<Extract<R, string[]>, D>}`
    : never
  : string;
type DottedLanguageObjectStringPaths = Join<PathsToStringProps<typeof en>, '.'>;

export const LangContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  language: Language.en,
  setLanguage: () => {},
});

export function LangProvider(props: PropsWithChildren) {
  const [language, setLanguage] = useState(Language.en);

  useEffect(() => {
    (async () => {
      // find user setting
      const langSett = await localdb.settings.get('language');
      if (langSett) {
        setLanguage(langSett.value as any);
        return;
      }
      // find navigator setting
      const navigatorLanguage = navigator.language.substring(0, 2);
      if (Object.values(Language).includes(navigatorLanguage as any)) {
        setLanguage(navigatorLanguage as any);
      }
    })();
  }, []);

  return (
    <LangContext.Provider value={{ language, setLanguage }}>
      {props.children}
    </LangContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LangContext);

  const t = useCallback(
    (
      key: DottedLanguageObjectStringPaths,
      ...args: (string | number | boolean | undefined)[]
    ) => {
      // look for key
      let curr: LocaleData | string = locales[ctx.language];
      const parts = key.split('.');
      for (const part of parts) {
        if (typeof curr === 'string') break;
        curr = curr[part];
        if (typeof curr === 'undefined') {
          console.error(`Key ${key} not found for translation`);
          return `[${key}]`;
        }
      }
      let value = curr as string;
      // replace args
      for (const { arg, idx } of args.map((arg, idx) => ({ arg, idx }))) {
        value = value.replace(
          new RegExp(`\\$${idx + 1}`, 'g'),
          (arg ?? '').toString()
        );
      }
      return value;
    },
    [ctx.language]
  );

  return {
    ...ctx,
    t,
    setLanguage: (lang: Language) => {
      // set language but also save in local db
      localdb.settings.put({
        key: 'language',
        value: lang,
      });
      ctx.setLanguage(lang);
    },
  };
}
