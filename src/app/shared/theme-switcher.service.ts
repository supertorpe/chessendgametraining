import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomController } from '@ionic/angular';

interface Theme {
  name: string;
  mainColor: string;
  styles: ThemeStyle[];
}

interface ThemeStyle {
  themeVariable: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeSwitcherService {

  private themes: Theme[] = [];
  private currentTheme: number = 0;

  constructor(private domCtrl: DomController, @Inject(DOCUMENT) private document) {
    this.themes = [
      {
        name: 'light blue',
        mainColor: '#3880ff',
        styles: [
          // primary
          { themeVariable: '--ion-color-primary', value: '#3880ff' },
          { themeVariable: '--ion-color-primary-rgb', value: '56,128,255' },
          { themeVariable: '--ion-color-primary-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-primary-shade', value: '#3171e0' },
          { themeVariable: '--ion-color-primary-tint', value: '#4c8dff' },
          // secondary
          { themeVariable: '--ion-color-secondary', value: '#0cd1e8' },
          { themeVariable: '--ion-color-secondary-rgb', value: '12,209,232' },
          { themeVariable: '--ion-color-secondary-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-secondary-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-secondary-shade', value: '#0bb8cc' },
          { themeVariable: '--ion-color-secondary-tint', value: '#24d6ea' },
          // tertiary
          { themeVariable: '--ion-color-tertiary', value: '#7044ff' },
          { themeVariable: '--ion-color-tertiary-rgb', value: '112,68,255' },
          { themeVariable: '--ion-color-tertiary-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-tertiary-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-tertiary-shade', value: '#633ce0' },
          { themeVariable: '--ion-color-tertiary-tint', value: '#7e57ff' },
          // success
          { themeVariable: '--ion-color-success', value: '#10dc60' },
          { themeVariable: '--ion-color-success-rgb', value: '16,220,96' },
          { themeVariable: '--ion-color-success-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-success-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-success-shade', value: '#0ec254' },
          { themeVariable: '--ion-color-success-tint', value: '#28e070' },
          // warning
          { themeVariable: '--ion-color-warning', value: '#ffce00' },
          { themeVariable: '--ion-color-warning-rgb', value: '255,206,0' },
          { themeVariable: '--ion-color-warning-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-warning-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-warning-shade', value: '#e0b500' },
          { themeVariable: '--ion-color-warning-tint', value: '#ffd31a' },
          // danger
          { themeVariable: '--ion-color-danger', value: '#f04141' },
          { themeVariable: '--ion-color-danger-rgb', value: '245,61,61' },
          { themeVariable: '--ion-color-danger-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-danger-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-danger-shade', value: '#d33939' },
          { themeVariable: '--ion-color-danger-tint', value: '#f25454' },
          // dark
          { themeVariable: '--ion-color-dark', value: '#222428' },
          { themeVariable: '--ion-color-dark-rgb', value: '34,34,34' },
          { themeVariable: '--ion-color-dark-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-dark-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-dark-shade', value: '#1e2023' },
          { themeVariable: '--ion-color-dark-tint', value: '#383a3e' },
          // medium
          { themeVariable: '--ion-color-medium', value: '#989aa2' },
          { themeVariable: '--ion-color-medium-rgb', value: '152,154,162' },
          { themeVariable: '--ion-color-medium-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-medium-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-medium-shade', value: '#86888f' },
          { themeVariable: '--ion-color-medium-tint', value: '#a2a4ab' },
          // light
          { themeVariable: '--ion-color-light', value: '#f4f5f8' },
          { themeVariable: '--ion-color-light-rgb', value: '244,244,244' },
          { themeVariable: '--ion-color-light-contrast', value: '#000000' },
          { themeVariable: '--ion-color-light-contrast-rgb', value: '0,0,0' },
          { themeVariable: '--ion-color-light-shade', value: '#d7d8da' },
          { themeVariable: '--ion-color-light-tint', value: '#f5f6f9' },
          // app colors
          { themeVariable: '--ion-background-color', value: '#ffffff' },
          { themeVariable: '--ion-overlay-background-color', value: '#ffffff' },
          { themeVariable: '--ion-text-color', value: '#000000' },
          { themeVariable: '--ion-item-background', value: '#ffffff' }
        ]
      },
      {
        name: 'dark',
        mainColor: '#000000',
        styles: [
          { themeVariable: '--ion-color-primary', value: '#000000' },
          { themeVariable: '--ion-color-primary-rgb', value: '0,0,0' },
          { themeVariable: '--ion-color-primary-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-primary-shade', value: '#000000' },
          { themeVariable: '--ion-color-primary-tint', value: '#1a1a1a' },
          
          { themeVariable: '--ion-color-secondary', value: '#444444' },
          { themeVariable: '--ion-color-secondary-rgb', value: '68,68,68' },
          { themeVariable: '--ion-color-secondary-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-secondary-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-secondary-shade', value: '#3c3c3c' },
          { themeVariable: '--ion-color-secondary-tint', value: '#575757' },
          
          { themeVariable: '--ion-color-tertiary', value: '#797979' },
          { themeVariable: '--ion-color-tertiary-rgb', value: '121,121,121' },
          { themeVariable: '--ion-color-tertiary-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-tertiary-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-tertiary-shade', value: '#6a6a6a' },
          { themeVariable: '--ion-color-tertiary-tint', value: '#868686' },

          { themeVariable: '--ion-color-success', value: '#054e22' },
          { themeVariable: '--ion-color-success-rgb', value: '5,78,34' },
          { themeVariable: '--ion-color-success-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-success-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-success-shade', value: '#04451e' },
          { themeVariable: '--ion-color-success-tint', value: '#1e6038' },

          { themeVariable: '--ion-color-warning', value: '#773c00' },
          { themeVariable: '--ion-color-warning-rgb', value: '119,60,0' },
          { themeVariable: '--ion-color-warning-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-warning-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-warning-shade', value: '#693500' },
          { themeVariable: '--ion-color-warning-tint', value: '#85501a' },

          { themeVariable: '--ion-color-danger', value: '#8a0b0b' },
          { themeVariable: '--ion-color-danger-rgb', value: '138,11,11' },
          { themeVariable: '--ion-color-danger-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-danger-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-danger-shade', value: '#790a0a' },
          { themeVariable: '--ion-color-danger-tint', value: '#962323' },

          { themeVariable: '--ion-color-dark', value: '#f4f4f4' },
          { themeVariable: '--ion-color-dark-rgb', value: '244,244,244' },
          { themeVariable: '--ion-color-dark-contrast', value: '#000000' },
          { themeVariable: '--ion-color-dark-contrast-rgb', value: '0,0,0' },
          { themeVariable: '--ion-color-dark-shade', value: '#d7d7d7' },
          { themeVariable: '--ion-color-dark-tint', value: '#f5f5f5' },
          
          { themeVariable: '--ion-color-medium', value: '#d5d6d9' },
          { themeVariable: '--ion-color-medium-rgb', value: '213,214,217' },
          { themeVariable: '--ion-color-medium-contrast', value: '#000000' },
          { themeVariable: '--ion-color-medium-contrast-rgb', value: '0,0,0' },
          { themeVariable: '--ion-color-medium-shade', value: '#bbbcbf' },
          { themeVariable: '--ion-color-medium-tint', value: '#d9dadd' },
          
          { themeVariable: '--ion-color-light', value: '#3f3f3f' },
          { themeVariable: '--ion-color-light-rgb', value: '63,63,63' },
          { themeVariable: '--ion-color-light-contrast', value: '#ffffff' },
          { themeVariable: '--ion-color-light-contrast-rgb', value: '255,255,255' },
          { themeVariable: '--ion-color-light-shade', value: '#373737' },
          { themeVariable: '--ion-color-light-tint', value: '#525252' },

          { themeVariable: '--ion-background-color', value: '#383838' },
          { themeVariable: '--ion-overlay-background-color', value: '#111111' },
          { themeVariable: '--ion-text-color', value: '#dfdfdf' },
          { themeVariable: '--ion-item-background', value: '#222222' }
        ]
      }
    ];
  }

  cycleTheme(): void {
    if (this.themes.length > this.currentTheme + 1) {
      this.currentTheme++;
    } else {
      this.currentTheme = 0;
    }
    this.setTheme(this.themes[this.currentTheme].name);
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  setTheme(name): void {
    const theme = this.themes.find(theme => theme.name === name);
    this.domCtrl.write(() => {
      theme.styles.forEach(style => {
        document.documentElement.style.setProperty(style.themeVariable, style.value);
      });
    });
  }

  getTheme(name): Theme {
    return this.themes.find(theme => theme.name === name);
  }

}