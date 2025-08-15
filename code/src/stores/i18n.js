import i18nData from '../static/i18n.json';

export default {
    currentLanguage: 'tr', // Varsayılan dil Türkçe
    data: i18nData,

    init() {
        // Tarayıcı dilini kontrol et
        const browserLang = navigator.language.split('-')[0];
        const supportedLanguages = Object.keys(this.data);

        // Eğer tarayıcı dili destekleniyorsa onu kullan
        if (supportedLanguages.includes(browserLang)) {
            this.currentLanguage = browserLang;
        }

        // Local storage'dan dil tercihini yükle
        const savedLang = localStorage.getItem('language');
        if (savedLang && supportedLanguages.includes(savedLang)) {
            this.currentLanguage = savedLang;
        }
    },

    setLanguage(lang) {
        if (this.data[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
        }
    },

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.data[this.currentLanguage];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if key not found
                value = this.data['en'];
                for (const k2 of keys) {
                    if (value && typeof value === 'object' && k2 in value) {
                        value = value[k2];
                    } else {
                        return key; // Return key if not found in any language
                    }
                }
                break;
            }
        }

        if (typeof value === 'string') {
            // Replace parameters in the string
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] || match;
            });
        }

        return key;
    }
};