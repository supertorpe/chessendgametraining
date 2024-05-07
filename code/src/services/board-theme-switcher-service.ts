import { BOARD_THEMES } from '../commons';
import { configurationService } from './configuration-service';

class BoardThemeSwitcherService {

    public getThemes() {
        return BOARD_THEMES;
    }

    public setTheme(theme: string) {
        const themeDefinition = BOARD_THEMES.find(item => item.name == theme);
        if (themeDefinition) themeDefinition.styles.forEach(style => {
            document.documentElement.style.setProperty(style.themeVariable, style.value);
          });
    }

    public currentTheme() {
        return configurationService.configuration.boardTheme;
    }

    public init() {
        this.setTheme(this.currentTheme());
    }
}

export const boardThemeSwitcherService = new BoardThemeSwitcherService();
