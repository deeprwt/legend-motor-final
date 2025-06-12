import {I18n} from 'i18n-js';
import en from './en.json';
import ar from './ar.json';
import zhCN from './zh-CN.json';
import es from './es.json';
import ru from './ru.json';
import fr from './fr.json';

// Create i18n instance
const i18n = new I18n({
  en,
  ar,
  'zh-CN': zhCN,
  es,
  ru,
  fr,
});

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export const translations = {
  en,
  ar,
  'zh-CN': zhCN,
  es,
  ru,
  fr,
};

export const getTranslation = (key, language = 'en') => {
  const keys = key.split('.');
  let translation = translations[language] || translations.en;

  for (const k of keys) {
    translation = translation[k];
    if (!translation) {
      return key;
    }
  }

  return translation;
};

export default i18n;
