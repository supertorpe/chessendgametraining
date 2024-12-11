// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import Alpine from 'alpinejs';
import { alertController } from '@ionic/core';
import { version } from '../../package.json';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, redrawIconImages, routeService, themeSwitcherService } from '../services';
import { EndgameDatabase } from '../model';
import { ariaDescriptionFromIcon, clone, isAndroid } from '../commons';
import { settingsController } from './settings';
import { aboutController } from './about';

class AppController extends BaseController {
    onEnter(_$routeParams?: any): void {
        Alpine.data('info', () => ({
            pieceTheme: configurationService.configuration.pieceTheme,
            color: themeSwitcherService.currentTheme() == 'dark' ? 'w' : 'b',
            categories: clone(endgameDatabaseService.endgameDatabase.categories),
            categorySelected: '',
            showExit: isAndroid(),
            selectCategory(category: string) {
                if (this.categorySelected != category) {
                    this.categorySelected = category;
                    this.$nextTick().then(() => { routeService.updatePageLinks(); });
                } else {
                    this.categorySelected = '';
                }
            },
            ariaDescriptionFromIcon: ariaDescriptionFromIcon,
            showSettings() {
                routeService.openModal('settings', 'page-settings.html', settingsController, true, false);
            },
            showAbout() {
                routeService.openModal('about', 'page-about.html', aboutController, true, false);
            },
            exit() {
                window.close();
            },
            init() {
                endgameDatabaseService.endgameDatabaseChangedEmitter.addEventListener((database: EndgameDatabase) => {
                    this.categories = clone(database.categories);
                });
                configurationService.configuration.configurationChangedEmitter.addEventListener((event) => {
                    switch (event.field) {
                      case 'colorTheme': this.color = (event.config.colorTheme == 'dark' ? 'w' : 'b'); break;
                      case 'pieceTheme': this.pieceTheme = event.config.pieceTheme; break;
                    }
                  });
                ['categorySelected'].forEach((item) => {
                    this.$watch(item, (_value) => {
                        redrawIconImages();
                    });
                });
                const currentVersion = `${version}/${endgameDatabaseService.endgameDatabase.version}`;
                if (configurationService.configuration.changelog != currentVersion) {
                    alertController.create({
                        header: window.AlpineI18n.t('app.changelog.title'),
                        message: window.AlpineI18n.t('app.changelog.description'),
                        buttons: [{
                            text: window.AlpineI18n.t('app.changelog.button'),
                            role: 'cancel',
                            cssClass: 'overlay-button',
                            handler: () => {
                                configurationService.configuration.changelog = currentVersion;
                                configurationService.save();
                            }
                        }]
                    }).then(alert => alert.present());
                }
            }
        }));
    }
}

export const appController = new AppController();
