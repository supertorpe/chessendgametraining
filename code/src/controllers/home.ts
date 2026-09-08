// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, routeService } from '../services';
import { getCategoryProgress } from '../commons';
import type { EndgameDatabase } from '../model';

class HomeController extends BaseController {
    private firstPositionShowed = false;
    private _scope: any;
    private _onEndgameDatabaseChanged = (_database: EndgameDatabase) => {
        if (this._scope) {
            this._scope.categories = endgameDatabaseService.endgameDatabase.categories;
        }
    };

    onEnter(_$routeParams?: any): void {
        const self = this;
        Alpine.data('info', () => ({
            categories: endgameDatabaseService.endgameDatabase.categories,
            getCategoryProgress: getCategoryProgress,
            init() {
                const scope = this;
                self._scope = scope;
                endgameDatabaseService.endgameDatabaseChangedEmitter.addEventListener(self._onEndgameDatabaseChanged);
                if (!self.firstPositionShowed && configurationService.configuration.automaticShowFirstPosition) {
                    self.firstPositionShowed = true;
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

    onExit(): Promise<boolean> {
        endgameDatabaseService.endgameDatabaseChangedEmitter.removeEventListener(this._onEndgameDatabaseChanged);
        return super.onExit();
    }
}

export const homeController = new HomeController();
