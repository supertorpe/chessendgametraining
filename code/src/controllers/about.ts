import Alpine from 'alpinejs';
import { version } from '../../package.json';
import { BaseController } from './controller';
import { aboutJson } from '../static';
import { IonModal } from '@ionic/core/components/ion-modal';
import { endgameDatabaseService } from '../services';

class AboutController extends BaseController {
    onEnter(_$routeParams?: any): void {
        Alpine.data('about', () => ({
            version: version,
            databaseVersion: endgameDatabaseService.endgameDatabase.version,
            items: aboutJson.items.map(item => { return {url: item.url, text: window.AlpineI18n.t(item.i18n) } }),
            close() {
                (document.querySelector('ion-modal') as IonModal).dismiss();
            },
        }));
    }
}

export const aboutController = new AboutController();
