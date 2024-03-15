import { THEMES } from '../commons';
import { configurationService } from './configuration-service';

class ThemeSwitcherService {

    public getThemes() {
        return THEMES;
    }

    public setTheme(theme: string) {
        if ('dark' == theme)
            document.querySelector('html')?.classList.add('ion-theme-dark');
        else
            document.querySelector('html')?.classList.remove('ion-theme-dark');
    }

    public currentTheme() {
        return document.querySelector('html')?.classList.contains('ion-theme-dark') ? 'dark' : 'light';
    }

    public init() {
        this.setTheme(configurationService.configuration.colorTheme);
    }
}

export const themeSwitcherService = new ThemeSwitcherService();
