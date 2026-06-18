import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import bn from './bn.json';
/** i18next configuration for Bangla and English UI strings. */
void i18n.use(initReactI18next).init({ resources:{ en:{ translation:en }, bn:{ translation:bn } }, lng:'bn', fallbackLng:'en', interpolation:{ escapeValue:false } });
export default i18n;
