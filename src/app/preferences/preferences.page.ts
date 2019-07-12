import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EndgameDatabaseService } from '../shared/endgame.database.service';
import { ConfigurationService } from '../shared/configuration.service';
import { Configuration } from '../shared/model';
import { ThemeSwitcherService } from '../shared/theme-switcher.service';
import { BoardThemeSwitcherService } from '../shared/board-theme-switcher.service';
import { AlertController, ToastController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-preferences',
  templateUrl: 'preferences.page.html',
  styleUrls: ['preferences.page.scss'],
})
export class PreferencesPage {

  @Input() isModal = false;

  public configuration: Configuration;
  public showThemes = false;
  public showPieceThemes = false;
  public showBoardThemes = false;
  private literals: any;
  public pieceThemes = ['alpha', 'california', 'cburnett', 'chess7', 'chessnut', 'chicago', 'companion', 'fantasy', 'iowa', 'kosal', 'leipzig', 'letter', 'merida', 'mono', 'oslo', 'pirouetti', 'pixel', 'reilly', 'riohacha', 'shapes', 'spatial', 'symmetric'];

  constructor(
    private platform: Platform,
    public modalController: ModalController,
    private sanitizer: DomSanitizer,
    private androidFullScreen: AndroidFullScreen,
    private endgameDatabaseService: EndgameDatabaseService,
    private configurationService: ConfigurationService,
    private toast: ToastController,
    public alertController: AlertController,
    public translate: TranslateService,
    private themeSwitcherService: ThemeSwitcherService,
    private boardThemeSwitcherService: BoardThemeSwitcherService) {
    this.configurationService.initialize().then(config => {
      this.configuration = config;
    });
    this.translate.get([
      'preferences.clean-dialog.title',
      'preferences.records-removed',
      'preferences.clean-dialog.subtitle',
      'preferences.clean-dialog.message',
      'preferences.clean-dialog.cancel',
      'preferences.clean-dialog.continue',
      'preferences.changes-saved']).subscribe(async res => {
        this.literals = res;
      });
  }

  trackFunc(index: number, obj: any) {
    return index;
  }
  
  toggleThemes() {
    this.showThemes = !this.showThemes;
    this.showPieceThemes = false;
    this.showBoardThemes = false;
  }
  
  selectTheme(theme) {
    this.configuration.colorTheme = theme;
    this.themeSwitcherService.setTheme(theme);
  }

  togglePieceThemes() {
    this.showPieceThemes = !this.showPieceThemes;
    this.showThemes = false;
    this.showBoardThemes = false;
  }
  
  selectPieceTheme(theme) {
    this.configuration.pieceTheme = theme;
    this.configurationService.notifyChanges(this.configuration);
  }

  toggleBoardThemes() {
    this.showBoardThemes = !this.showBoardThemes;
    this.showThemes = false;
    this.showPieceThemes = false;
  }
  
  selectBoardTheme(theme) {
    this.configuration.boardTheme = theme.name;
    this.boardThemeSwitcherService.setTheme(theme.name);
  }

  getBoardBackground(themeName) {
    return  this.sanitizer.bypassSecurityTrustStyle(this.configuration.boardTheme === themeName ? 'var(--ion-color-light)' : '');
  }

  btnCloseClick() {
    this.modalController.dismiss({config: this.configuration});
  }

  async cleanDatabase() {
    const alert = await this.alertController.create({
      header: this.literals['preferences.clean-dialog.title'],
      subHeader: this.literals['preferences.clean-dialog.subtitle'],
      message: this.literals['preferences.clean-dialog.message'],
      buttons: [
        {
          text: this.literals['preferences.clean-dialog.cancel'],
          role: 'cancel',
          cssClass: 'overlay-button',
          handler: () => {
          }
        }, {
          text: this.literals['preferences.clean-dialog.continue'],
          cssClass: 'overlay-button',
          handler: () => {
            this.endgameDatabaseService.cleanDatabase().then(async () => {
              const toast = await this.toast.create({
                message: this.literals['preferences.records-removed'],
                position: 'middle',
                color: 'success',
                duration: 1000
              });
              toast.present();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  changeFullScreen(event) {
    if (event) {
      this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode());
    } else {
      this.androidFullScreen.showSystemUI();
    }
  }

  save() {
    this.configurationService.save().then(async () => {
      const toast = await this.toast.create({
        message: this.literals['preferences.changes-saved'],
        position: 'middle',
        color: 'success',
        duration: 1000
      });
      toast.present();
      if (this.isModal) {
        this.btnCloseClick();
      }
    });
  }

}
