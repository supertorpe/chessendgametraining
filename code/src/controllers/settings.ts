import { PIECE_THEMES, BOARD_THEMES } from '../commons';
import { redrawIconImages, themeSwitcherService, configurationService } from '../services';
import { BaseController } from './controller';
import Alpine from 'alpinejs';
import { toastController } from '@ionic/core';
import { IonModal } from '@ionic/core/components/ion-modal';
import { IonToggle } from '@ionic/core/components/ion-toggle';
import { IonRange } from '@ionic/core/components/ion-range';

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
            // goto position
            gotoPosition: configurationService.configuration.automaticShowFirstPosition,
            gotoPositionChanged(checked: boolean) {
                this.gotoPosition = checked;
                configurationService.configuration.automaticShowFirstPosition = checked;
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
                
                const toggleGotoPosition = document.getElementById('toggleGotoPosition') as IonToggle;
                toggleGotoPosition.addEventListener('ionChange', () => { this.gotoPositionChanged(toggleGotoPosition.checked); });

                const toggleUseSyzygy = document.getElementById('toggleUseSyzygy') as IonToggle;
                toggleUseSyzygy.addEventListener('ionChange', () => { this.useSyzygyChanged(toggleUseSyzygy.checked); });
          
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

                ['showThemes', 'showPieceThemes', 'showBoardThemes'].forEach((item) => {
                    this.$watch(item, (_value) => {
                        redrawIconImages();
                    });
                });
                configurationService.configuration.configurationChangedEmitter.addEventListener(async (event) => {
                    switch (event.field) {
                        case 'useSyzygy' : this.useSyzygy = event.config.useSyzygy; break;
                        case 'stockfishDepth' : this.currentStockfishDepth = event.config.stockfishDepth; break;
                        case 'stockfishMovetime' : this.currentStockfishMovetime = event.config.stockfishMovetime; break;
                        case 'automaticShowFirstPosition' : this.gotoPosition = event.config.automaticShowFirstPosition; break;
                        //case 'colorTheme' : this.currentTheme = event.config.colorTheme;
                        case 'playSounds' : this.playSounds = event.config.playSounds; break;
                        case 'highlightSquares' : this.highlightSquares = event.config.highlightSquares; break;
                        case 'pieceTheme' : this.currentPieceTheme = event.config.pieceTheme; break;
                        case 'boardTheme' : this.currentBoardTheme = event.config.boardTheme; break;
                        case 'syncGoogleDrive' : this.syncGoogleDrive = event.config.syncGoogleDrive; break;
                    }
                });
            }
        }));
    }
}

export const settingsController = new SettingsController();
