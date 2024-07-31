import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import global_en from "./locales/en/global.json";
import global_bs from "./locales/bs/global.json";

i18n.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  fallbackLng: "en",
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
