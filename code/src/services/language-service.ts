// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { i18nJson } from '../static';
import { configurationService } from './configuration-service';

export interface Language {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
}

class LanguageService {

    private supportedLanguages: Language[] = [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
        { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
        { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
        { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' }
    ];

    public getSupportedLanguages(): Language[] {
        return this.supportedLanguages;
    }

    public detectBrowserLanguage(): string {
        const browserLang = navigator.language;
        const availableLanguages = Object.keys(i18nJson);
        
        // Direct match
        if (availableLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        // Language prefix match (e.g., 'tr-TR' matches 'tr')
        const langPrefix = browserLang.split('-')[0];
        if (availableLanguages.includes(langPrefix)) {
            return langPrefix;
        }
        
        // Fallback to English
        return 'en';
    }

    public getCurrentLanguage(): string {
        const config = configurationService.configuration;
        if (config.language === 'auto') {
            return this.detectBrowserLanguage();
        }
        return config.language;
    }

    public setLanguage(languageCode: string): void {
        const config = configurationService.configuration;
        config.language = languageCode;
        
        // Update Alpine i18n
        if (window.AlpineI18n) {
            const targetLang = languageCode === 'auto' ? this.detectBrowserLanguage() : languageCode;
            window.AlpineI18n.locale = targetLang;
            document.documentElement.lang = targetLang;
        }
        
        // Save configuration
        configurationService.save();
    }

    public initializeLanguage(): void {
        const currentLang = this.getCurrentLanguage();
        document.documentElement.lang = currentLang;
    }

}

export const languageService = new LanguageService();