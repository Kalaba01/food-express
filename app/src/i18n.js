import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import global_en from "./locales/en/global.json";
import global_bs from "./locales/bs/global.json";

const defaultLanguage = "en";
if (!localStorage.getItem('language')) {
  localStorage.setItem('language', defaultLanguage);
}

i18n.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  fallbackLng: defaultLanguage,
  lng: localStorage.getItem('language'),
  resources: {
    en: {
      global: global_en,
    },
    bs: {
      global: global_bs,
    },
  },
});

export default i18n;
