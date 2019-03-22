import { Component } from '@angular/core';
import { EndgameDatabaseService } from '../shared';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-preferences',
  templateUrl: 'preferences.page.html',
  styleUrls: ['preferences.page.scss'],
})
export class PreferencesPage {

  constructor(
    private endgameDatabaseService: EndgameDatabaseService, public alertController: AlertController,
    public translate: TranslateService) {
  }
  
  async cleanDatabase() {
    this.translate.get([
      'preferences.clean-dialog.title',
      'preferences.clean-dialog.subtitle',
      'preferences.clean-dialog.message',
      'preferences.clean-dialog.cancel',
      'preferences.clean-dialog.continue']).subscribe(async res => {
        const alert = await this.alertController.create({
          header: res['preferences.clean-dialog.title'],
          subHeader: res['preferences.clean-dialog.subtitle'],
          message: res['preferences.clean-dialog.message'],
          buttons: [
            {
              text: res['preferences.clean-dialog.cancel'],
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
              }
            }, {
              text: res['preferences.clean-dialog.continue'],
              handler: () => {
                this.endgameDatabaseService.cleanDatabase();
              }
            }
          ]
        });
        await alert.present();
      });
  }

}
