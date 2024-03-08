import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { endgameDatabaseService } from '../services';

class HomeController extends BaseController {
    onEnter(_$routeParams?: any): void {
        Alpine.data('info', () => ({
            categories: endgameDatabaseService.endgameDatabase.categories
        }));
    }
}

export const homeController = new HomeController();
