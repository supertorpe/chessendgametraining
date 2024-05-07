import { THEMES } from '../commons';
import { configurationService } from './configuration-service';

class ThemeSwitcherService {

    public getThemes() {
        return THEMES;
    }

    public setTheme(theme: string) {
        if ('dark' == theme)
            document.querySelector('html')?.classList.add('ion-palette-dark');
        else
            document.querySelector('html')?.classList.remove('ion-palette-dark');
    }

    public currentTheme() {
        return document.querySelector('html')?.classList.contains('ion-palette-dark') ? 'dark' : 'light';
    }

    public init() {
        this.setTheme(configurationService.configuration.colorTheme);
    }
}

export const themeSwitcherService = new ThemeSwitcherService();
