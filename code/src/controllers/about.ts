import Alpine from 'alpinejs';
import { version } from '../../package.json';
import { BaseController } from './controller';
import { aboutJson } from '../static';
import { stockfishService } from '../services';

class AboutController extends BaseController {
    onEnter(_$routeParams?: any): void {
        Alpine.data('info', () => ({
            version: version,
            items: aboutJson.items.map(item => { return {url: item.url, text: window.AlpineI18n.t(item.i18n, {'stockfishRunningVersion': stockfishService.version}) } })
        }));
    }
}

export const aboutController = new AboutController();
