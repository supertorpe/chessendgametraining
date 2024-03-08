import { BaseController } from './controller';
import Alpine from 'alpinejs';
import { IonModal } from '@ionic/core/components/ion-modal';
import { configurationService } from '../services';

class PromotionController extends BaseController {
    private player!: string
    setInfo(player: string) {
        this.player = player;
    }
    onEnter(_$routeParams?: any): void {
        Alpine.data('promotion', () => ({
            player: this.player,
            currentPieceTheme: configurationService.configuration.pieceTheme,
            select(piece: string) {
                (document.querySelector('ion-modal') as IonModal).dismiss({piece: piece});
            }
        }));
    }
}

export const promotionController = new PromotionController();
