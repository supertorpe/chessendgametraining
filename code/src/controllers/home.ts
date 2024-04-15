import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, routeService } from '../services';

class HomeController extends BaseController {
    onEnter(_$routeParams?: any): void {
        Alpine.data('info', () => ({
            categories: endgameDatabaseService.endgameDatabase.categories,
            init() {
                if (configurationService.configuration.automaticShowFirstPosition) {
                    for (const [idxCategory, category] of endgameDatabaseService.endgameDatabase.categories.entries()) {
                        for (const [idxSubcategory, subcategory] of category.subcategories.entries()) {
                            for (const [idxGame, game] of subcategory.games.entries()) {
                                if ((!game.record || game.record < 0)) {
                                    if ((idxCategory > 0 || idxSubcategory > 0 || idxGame > 0 || game.record < 0))
                                        routeService.navigate(`/position/${idxCategory}/${idxSubcategory}/${idxGame}`);
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }));
    }
}

export const homeController = new HomeController();
