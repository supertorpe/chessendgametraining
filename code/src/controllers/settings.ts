// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { PIECE_THEMES, BOARD_THEMES } from '../commons';
import { redrawIconImages, themeSwitcherService, configurationService, endgameDatabaseService, languageService } from '../services';
import { BaseController } from './controller';
import Alpine from 'alpinejs';
import { toastController } from '@ionic/core';
import { IonModal } from '@ionic/core/components/ion-modal';
import { IonToggle } from '@ionic/core/components/ion-toggle';
import { IonRange } from '@ionic/core/components/ion-range';

type AutoSolveTrivialOptions = "prompt" | "yes" | "no"

class SettingsController extends BaseController {
    onEnter(_$routeParams?: any): void {

        Alpine.data('settings', () => ({
            color: themeSwitcherService.currentTheme() == 'dark' ? 'w' : 'b',
            // theme
            showThemes: false,
            themes: themeSwitcherService.getThemes(),
            currentTheme() {
                return configurationService.configuration.colorTheme;
            },
            toggleThemes() {
                this.showThemes = !this.showThemes;
                this.showPieceThemes = false;
                this.showBoardThemes = false;
            },
            setTheme(theme: string) {
                configurationService.configuration.colorTheme = theme;
                this.color = themeSwitcherService.currentTheme() == 'dark' ? 'w' : 'b';
            },
            // piece theme
            showPieceThemes: false,
            pieceThemes: PIECE_THEMES,
            currentPieceTheme: configurationService.configuration.pieceTheme,
            togglePieceThemes() {
                this.showPieceThemes = !this.showPieceThemes;
                this.showThemes = false;
                this.showBoardThemes = false;
            },
            setPieceTheme(pieceTheme: string) {
                this.currentPieceTheme = pieceTheme;
                configurationService.configuration.pieceTheme = pieceTheme;
            },
            // board theme
            showBoardThemes: false,
            boardThemes: BOARD_THEMES,
            currentBoardTheme: configurationService.configuration.boardTheme,
            toggleBoardThemes() {
                this.showBoardThemes = !this.showBoardThemes;
                this.showThemes = false;
                this.showPieceThemes = false;

            },
            setBoardTheme(boardTheme: string) {
                this.currentBoardTheme = boardTheme;
                configurationService.configuration.boardTheme = boardTheme;
            },
            // language
            showLanguages: false,
            availableLanguages: languageService.getSupportedLanguages(),
            currentLanguage: configurationService.configuration.language,
            toggleLanguages() {
                this.showLanguages = !this.showLanguages;
                this.showThemes = false;
                this.showPieceThemes = false;
                this.showBoardThemes = false;
            },
            setLanguage(languageCode: string) {
                this.currentLanguage = languageCode;
                configurationService.configuration.language = languageCode;
                languageService.setLanguage(languageCode);
            },
            getCurrentLanguageDisplay() {
                if (this.currentLanguage === 'auto') {
                    const detectedLang = languageService.detectBrowserLanguage();
                    const lang = this.availableLanguages.find(l => l.code === detectedLang);
                    return `Auto (${lang?.nativeName || 'English'})`;
                }
                const lang = this.availableLanguages.find(l => l.code === this.currentLanguage);
                return lang?.nativeName || 'English';
            },
            // accessibility
            reducedMotion: configurationService.configuration.reducedMotion,
            highContrast: configurationService.configuration.highContrast,
            screenReaderAnnouncements: configurationService.configuration.screenReaderAnnouncements,
            reducedMotionChanged(value: boolean) {
                this.reducedMotion = value;
                configurationService.configuration.reducedMotion = value;
            },
            highContrastChanged(value: boolean) {
                this.highContrast = value;
                configurationService.configuration.highContrast = value;
            },
            screenReaderAnnouncementsChanged(value: boolean) {
                this.screenReaderAnnouncements = value;
                configurationService.configuration.screenReaderAnnouncements = value;
            },
            // goto first position
            gotoFirstPosition: configurationService.configuration.automaticShowFirstPosition,
            gotoFirstPositionChanged(checked: boolean) {
                this.gotoFirstPosition = checked;
                configurationService.configuration.automaticShowFirstPosition = checked;
            },
            // goto next position
            gotoNextPosition: configurationService.configuration.automaticShowNextPosition,
            gotoNextPositionChanged(checked: boolean) {
                this.gotoNextPosition = checked;
                configurationService.configuration.automaticShowNextPosition = checked;
            },
            // automatically solve trivial positions
            get autoSolveTrivial(): AutoSolveTrivialOptions {
                const solve = configurationService.configuration.solveTrivialPosition;
                if (solve === true) return "yes"
                if (solve === false) return "no"
                return "prompt"
            }, 
            autoSolveTrivialChanged(value: AutoSolveTrivialOptions) {
                // Set to null to have the user be prompted
                // or set it to automatically do the desired behavior
                const setting =
                    value === "prompt" ? null :
                    value === "yes";
                configurationService.configuration.solveTrivialPosition = setting;
            },
            // play sounds
            playSounds: configurationService.configuration.playSounds,
            playSoundsChanged(checked: boolean) {
                this.playSounds = checked;
                configurationService.configuration.playSounds = checked;
            },
            // highlight squares
            highlightSquares: configurationService.configuration.highlightSquares,
            highlightSquaresChanged(checked: boolean) {
                this.highlightSquares = checked;
                configurationService.configuration.highlightSquares = checked;
            },
             // sync google drive
             syncGoogleDrive: configurationService.configuration.syncGoogleDrive,
             syncGoogleDriveChanged(checked: boolean) {
                 this.syncGoogleDrive = checked;
                 configurationService.configuration.syncGoogleDrive = checked;
             },
            // use syzygy
            useSyzygy: configurationService.configuration.useSyzygy,
            useSyzygyChanged(checked: boolean) {
                this.useSyzygy = checked;
                configurationService.configuration.useSyzygy = checked;
            },
            // threefold repetition check
            threeFoldRepetitionCheck: configurationService.configuration.threeFoldRepetitionCheck,
            threeFoldRepetitionCheckChanged(checked: boolean) {
                this.threeFoldRepetitionCheck = checked;
                configurationService.configuration.threeFoldRepetitionCheck = checked;
            },
            // stockfish depth
            currentStockfishDepth: configurationService.configuration.stockfishDepth,
            changeStockfishDepth(value: number) {
                this.currentStockfishDepth = value;
                configurationService.configuration.stockfishDepth = value;  
            },
            // stockfish movetime
            currentStockfishMovetime: configurationService.configuration.stockfishMovetime,
            changeStockfishMovetime(value: number) {
                this.currentStockfishMovetime = value;
                configurationService.configuration.stockfishMovetime = value;  
            },
            // save settings
            save() {
                configurationService.save().then(async () => {
                    const toast = await toastController.create({
                        message: window.AlpineI18n.t('settings.changes-saved'),
                        position: 'middle',
                        color: 'success',
                        duration: 1000
                    });
                    toast.present();
                    this.close();
                });
            },
            exportData() {
                endgameDatabaseService.exportData();
            },
            importData() {
                const fileInput = document.getElementById('import_file') as HTMLInputElement;
                fileInput.addEventListener("change", (event: Event) => {
                    const input = event.target as HTMLInputElement;
                    if (input.files && input.files.length === 1) {
                        const file = input.files[0];
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            if (e.target && typeof e.target.result === "string") {
                                const jsonData = e.target.result;
                                try {
                                    const data = JSON.parse(jsonData);
                                    endgameDatabaseService.importData(data).then(async () => {
                                        const toast = await toastController.create({
                                            message: window.AlpineI18n.t('settings.import-finished'),
                                            position: 'middle',
                                            color: 'success',
                                            duration: 1000
                                        });
                                        toast.present();
                                    });
                                } catch (error) {
                                    const toast = await toastController.create({
                                        message: window.AlpineI18n.t('settings.import-error'),
                                        position: 'middle',
                                        color: 'warning',
                                        duration: 1000
                                    });
                                    toast.present();
                                }
                            }
                        };
                        reader.onerror = async () => {
                            const toast = await toastController.create({
                                message: window.AlpineI18n.t('settings.import-error'),
                                position: 'middle',
                                color: 'warning',
                                duration: 1000
                            });
                            toast.present();
                        };
                        reader.readAsText(file);
                    }
                });
                fileInput.click();
            },
            close() {
                (document.querySelector('ion-modal') as IonModal).dismiss();
            },
            init() {
                const toggleHighlightSquares = document.getElementById('toggleHighlightSquares') as IonToggle;
                toggleHighlightSquares.addEventListener('ionChange', () => { this.highlightSquaresChanged(toggleHighlightSquares.checked); });
                
                const toggleSyncGoogleDrive = document.getElementById('toggleSyncGoogleDrive') as IonToggle;
                toggleSyncGoogleDrive.addEventListener('ionChange', () => { this.syncGoogleDriveChanged(toggleSyncGoogleDrive.checked); });

                const togglePlaySounds = document.getElementById('togglePlaySounds') as IonToggle;
                togglePlaySounds.addEventListener('ionChange', () => { this.playSoundsChanged(togglePlaySounds.checked); });
                
                const toggleGotoFirstPosition = document.getElementById('toggleGotoFirstPosition') as IonToggle;
                toggleGotoFirstPosition.addEventListener('ionChange', () => { this.gotoFirstPositionChanged(toggleGotoFirstPosition.checked); });

                const autoSolveTrivial = document.getElementById('autoSolveTrivial') as HTMLIonSelectElement;
                autoSolveTrivial.addEventListener('ionChange', () => { 
                    this.autoSolveTrivialChanged(autoSolveTrivial.value)
                });
                
                const toggleGotoNextPosition = document.getElementById('toggleGotoNextPosition') as IonToggle;
                toggleGotoNextPosition.addEventListener('ionChange', () => { this.gotoNextPositionChanged(toggleGotoNextPosition.checked); });

                const toggleUseSyzygy = document.getElementById('toggleUseSyzygy') as IonToggle;
                toggleUseSyzygy.addEventListener('ionChange', () => { this.useSyzygyChanged(toggleUseSyzygy.checked); });
          
                const toggleThreefoldRepetitionCheck = document.getElementById('toggleThreefoldRepetitionCheck') as IonToggle;
                toggleThreefoldRepetitionCheck.addEventListener('ionChange', () => { this.threeFoldRepetitionCheckChanged(toggleThreefoldRepetitionCheck.checked); });
          
                const stockfishDepthRange = document.getElementById('stockfishDepthRange') as IonRange;
                stockfishDepthRange.value = configurationService.configuration.stockfishDepth;
                stockfishDepthRange.addEventListener('ionChange', () => {
                    if (typeof stockfishDepthRange.value ===  'number') this.changeStockfishDepth(stockfishDepthRange.value);
                });

                const stockfishMovetimeRange = document.getElementById('stockfishMovetimeRange') as IonRange;
                stockfishMovetimeRange.value = configurationService.configuration.stockfishMovetime;
                stockfishMovetimeRange.addEventListener('ionChange', () => {
                    if (typeof stockfishMovetimeRange.value ===  'number') this.changeStockfishMovetime(stockfishMovetimeRange.value);
                });

                // Accessibility toggles
                const toggleReducedMotion = document.getElementById('toggleReducedMotion') as IonToggle;
                if (toggleReducedMotion) {
                    toggleReducedMotion.addEventListener('ionChange', () => { this.reducedMotionChanged(toggleReducedMotion.checked); });
                }
                
                const toggleHighContrast = document.getElementById('toggleHighContrast') as IonToggle;
                if (toggleHighContrast) {
                    toggleHighContrast.addEventListener('ionChange', () => { this.highContrastChanged(toggleHighContrast.checked); });
                }
                
                const toggleScreenReaderAnnouncements = document.getElementById('toggleScreenReaderAnnouncements') as IonToggle;
                if (toggleScreenReaderAnnouncements) {
                    toggleScreenReaderAnnouncements.addEventListener('ionChange', () => { this.screenReaderAnnouncementsChanged(toggleScreenReaderAnnouncements.checked); });
                }

                ['showThemes', 'showPieceThemes', 'showBoardThemes', 'showLanguages'].forEach((item) => {
                    this.$watch(item, (_value) => {
                        redrawIconImages();
                    });
                });
                configurationService.configuration.configurationChangedEmitter.addEventListener(async (event) => {
                    switch (event.field) {
                        case 'useSyzygy' : this.useSyzygy = event.config.useSyzygy; break;
                        case 'threeFoldRepetitionCheck' : this.threeFoldRepetitionCheck = event.config.threeFoldRepetitionCheck; break;
                        case 'stockfishDepth' : this.currentStockfishDepth = event.config.stockfishDepth; break;
                        case 'stockfishMovetime' : this.currentStockfishMovetime = event.config.stockfishMovetime; break;
                        case 'automaticShowFirstPosition' : this.gotoFirstPosition = event.config.automaticShowFirstPosition; break;
                        case 'automaticShowNextPosition' : this.gotoNextPosition = event.config.automaticShowNextPosition; break;
                        //case 'colorTheme' : this.currentTheme = event.config.colorTheme;
                        case 'playSounds' : this.playSounds = event.config.playSounds; break;
                        case 'highlightSquares' : this.highlightSquares = event.config.highlightSquares; break;
                        case 'pieceTheme' : this.currentPieceTheme = event.config.pieceTheme; break;
                        case 'boardTheme' : this.currentBoardTheme = event.config.boardTheme; break;
                        case 'syncGoogleDrive' : this.syncGoogleDrive = event.config.syncGoogleDrive; break;
                        case 'language' : this.currentLanguage = event.config.language; break;
                        case 'reducedMotion' : this.reducedMotion = event.config.reducedMotion; break;
                        case 'highContrast' : this.highContrast = event.config.highContrast; break;
                        case 'screenReaderAnnouncements' : this.screenReaderAnnouncements = event.config.screenReaderAnnouncements; break;
                    }
                });
            }
        }));
    }
}

export const settingsController = new SettingsController();
