import AlpineI18n from 'alpinejs-i18n';
import Alpine from 'alpinejs';
import { i18nJson } from '../static';

class AlpineService {

    private hideLoader() {
        const loaderContainer = document.querySelector('.loader-container');
        if (loaderContainer) { loaderContainer.remove(); }
    }

    private i18n() {
        document.addEventListener('alpine-i18n:ready', () => {
            const browserLang = navigator.language;
            let candidate = '';
            let created = false;
            Object.keys(i18nJson).forEach((key) => {
                if (!window.AlpineI18n.fallbackLocale) {
                    window.AlpineI18n.fallbackLocale = key;
                }
                if (!created) {
                    if (key == browserLang) {
                        window.AlpineI18n.create(key, i18nJson);
                        created = true;
                        document.documentElement.lang = key;
                    } else if (!candidate && browserLang.startsWith(key)) {
                        candidate = key;
                    }
                }
            });
            if (!created) {
                if (candidate) {
                    window.AlpineI18n.create(candidate, i18nJson);
                    document.documentElement.lang = candidate;
                } else {
                    window.AlpineI18n.create(window.AlpineI18n.fallbackLocale, i18nJson);
                    document.documentElement.lang = window.AlpineI18n.fallbackLocale;
                }
            }
        });
    }

    public init() {
        this.i18n();
        Alpine.plugin(AlpineI18n);
        Alpine.start();
        this.hideLoader();
    }

}

export const alpineService = new AlpineService();
