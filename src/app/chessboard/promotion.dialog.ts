import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService, Configuration } from '../shared';

@Component({
  selector: 'chessboard-promotion',
  templateUrl: 'promotion.dialog.html',
  styleUrls: ['promotion.dialog.scss'],
})
export class PromotionDialog {

  public configuration: Configuration;

  @Input() turn: string;

  constructor(public modalController: ModalController, public translate: TranslateService, private configurationService: ConfigurationService) {
    this.configurationService.initialize().then(config => {
      this.configuration = config;
    });
  }

  select(piece) {
    this.modalController.dismiss({piece: piece});
  }
  
}
