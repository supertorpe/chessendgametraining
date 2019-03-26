import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'chessboard-promotion',
  templateUrl: 'promotion.dialog.html',
  styleUrls: ['promotion.dialog.scss'],
})
export class PromotionDialog {

  @Input() turn: string;

  constructor(public modalController: ModalController, public translate: TranslateService) { }

  select(piece) {
    this.modalController.dismiss({piece: piece});
  }
  
}
