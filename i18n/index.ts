
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import en from './locales/en';
import tr from './locales/tr';
import ru from './locales/ru';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
import it from './locales/it';
import pt from './locales/pt';
import pl from './locales/pl';
import zh from './locales/zh';
import ja from './locales/ja';
import ar from './locales/ar';

const translations = { en, tr, ru, de, fr, es, it, pt, pl, zh, ja, ar };

type Locale = keyof typeof translations;

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Locale => {
    if (typeof window !== 'undefined') {
        const savedLang = localStorage.getItem('app-language');
        if (savedLang && Object.keys(translations).includes(savedLang)) {
            return savedLang as Locale;
        }
        const browserLang = navigator.language.split('-')[0];
        if (Object.keys(translations).includes(browserLang)) {
            return browserLang as Locale;
        }
    }
    return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (langCode: string) => {
    if (Object.keys(translations).includes(langCode)) {
      setLanguageState(langCode as Locale);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  };

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};