import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomController } from '@ionic/angular';

interface BoardTheme {
  name: string;
  styles: BoardThemeStyle[];
}

interface BoardThemeStyle {
  themeVariable: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoardThemeSwitcherService {

  private themes: BoardTheme[] = [];
  private currentTheme: number = 0;

  constructor(private domCtrl: DomController, @Inject(DOCUMENT) private document) {
    this.themes = [
      {
        name: 'brown',
        styles: [
          { themeVariable: '--chess-white-background', value: '#F3E1C2' },
          { themeVariable: '--chess-white-color', value: '#C39976' },
          { themeVariable: '--chess-black-background', value: '#C39976' },
          { themeVariable: '--chess-black-color', value: '#F3E1C2' },
        ]
      },
      {
        name: 'blue',
        styles: [
          { themeVariable: '--chess-white-background', value: '#E4E9EB' },
          { themeVariable: '--chess-white-color', value: '#9DB1BB' },
          { themeVariable: '--chess-black-background', value: '#9DB1BB' },
          { themeVariable: '--chess-black-color', value: '#E4E9EB' },
        ]
      },
      {
        name: 'green',
        styles: [
          { themeVariable: '--chess-white-background', value: '#FFFEE4' },
          { themeVariable: '--chess-white-color', value: '#97B378' },
          { themeVariable: '--chess-black-background', value: '#97B378' },
          { themeVariable: '--chess-black-color', value: '#FFFEE4' },
        ]
      },
      {
        name: 'grey',
        styles: [
          { themeVariable: '--chess-white-background', value: '#AAAAAA' },
          { themeVariable: '--chess-white-color', value: '#888888' },
          { themeVariable: '--chess-black-background', value: '#888888' },
          { themeVariable: '--chess-black-color', value: '#AAAAAA' },
        ]
      },
      {
        name: 'pink',
        styles: [
          { themeVariable: '--chess-white-background', value: '#FFF2F2' },
          { themeVariable: '--chess-white-color', value: '#BC4545' },
          { themeVariable: '--chess-black-background', value: '#BC4545' },
          { themeVariable: '--chess-black-color', value: '#FFF2F2' },
        ]
      },
      {
        name: 'navy',
        styles: [
          { themeVariable: '--chess-white-background', value: '#ECECEC' },
          { themeVariable: '--chess-white-color', value: '#385170' },
          { themeVariable: '--chess-black-background', value: '#385170' },
          { themeVariable: '--chess-black-color', value: '#ECECEC' },
        ]
      },
      {
        name: 'dark-green',
        styles: [
          { themeVariable: '--chess-white-background', value: '#E0EFBA' },
          { themeVariable: '--chess-white-color', value: '#467A4B' },
          { themeVariable: '--chess-black-background', value: '#467A4B' },
          { themeVariable: '--chess-black-color', value: '#E0EFBA' },
        ]
      },
      {
        name: 'black-white',
        styles: [
          { themeVariable: '--chess-white-background', value: '#F2F2F2' },
          { themeVariable: '--chess-white-color', value: '#0C0C0C' },
          { themeVariable: '--chess-black-background', value: '#0C0C0C' },
          { themeVariable: '--chess-black-color', value: '#F2F2F2' },
        ]
      }
    ]
  };

  cycleTheme(): void {
    if (this.themes.length > this.currentTheme + 1) {
      this.currentTheme++;
    } else {
      this.currentTheme = 0;
    }
    this.setTheme(this.themes[this.currentTheme].name);
  }

  getThemes(): BoardTheme[] {
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

  getTheme(name): BoardTheme {
    return this.themes.find(theme => theme.name === name);
  }

}