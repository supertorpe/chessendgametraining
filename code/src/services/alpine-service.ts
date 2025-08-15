// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import AlpineI18n from 'alpinejs-i18n';
import Alpine from 'alpinejs';
import { i18nJson } from '../static';
import { languageService } from './language-service';

class AlpineService {

    private hideLoader() {
        const loaderContainer = document.querySelector('.loader-container');
        if (loaderContainer) { loaderContainer.remove(); }
    }

    private i18n() {
        document.addEventListener('alpine-i18n:ready', () => {
            // Set fallback locale to English
            window.AlpineI18n.fallbackLocale = 'en';
            
            // Get the current language from language service
            const currentLanguage = languageService.getCurrentLanguage();
            
            // Create Alpine i18n with the determined language
            window.AlpineI18n.create(currentLanguage, i18nJson);
            document.documentElement.lang = currentLanguage;
            
            // Initialize language service
            languageService.initializeLanguage();
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
