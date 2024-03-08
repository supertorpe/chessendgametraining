import { THEMES } from '../commons';
import { configurationService } from './configuration-service';

class ThemeSwitcherService {

    public getThemes() {
        return THEMES;
    }

    public setTheme(theme: string) {
        if ('dark' == theme)
            document.querySelector('body')?.classList.add('dark');
        else
            document.querySelector('body')?.classList.remove('dark');
    }

    public currentTheme() {
        return document.querySelector('body')?.classList.contains('dark') ? 'dark' : 'light';
    }

    public init() {
        this.setTheme(configurationService.configuration.colorTheme);
    }
}

export const themeSwitcherService = new ThemeSwitcherService();
