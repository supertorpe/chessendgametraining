import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { endgameDatabaseService } from '../services';
import { ariaDescriptionFromIcon, clone, setupSEO } from '../commons';
import { EndgameDatabase } from '../model';

class ListController extends BaseController {

    private title!: string;
    private seo!: string;

    onEnter($routeParams?: any): void {
        const self = this;
        const endgameDatabase = endgameDatabaseService.endgameDatabase;
        const categories = endgameDatabase.categories;
        const idxCategory = parseInt($routeParams['idxCategory']);
        const idxSubcategory = parseInt($routeParams['idxSubcategory']);
        const category = categories[idxCategory];
        const subcategory = category.subcategories[idxSubcategory];
        const idxLastSubcategory = category.count - 1;

        this.title = `${window.AlpineI18n.t(`category.${category.name}`)} [ ${idxSubcategory + 1} / ${idxLastSubcategory + 1} ]`;
        this.seo = `${window.AlpineI18n.t(`category.${category.name}`)} (${subcategory.name}) ${idxSubcategory + 1}/${idxLastSubcategory + 1}`;

        Alpine.data('info', () => ({
            title: this.title,
            idxCategory: idxCategory,
            idxSubcategory: idxSubcategory,
            category: category,
            subcategory: subcategory,
            gameCount: subcategory.games.length,
            idxLastSubcategory: idxLastSubcategory,
            showNavPrev: idxSubcategory > 0 || idxCategory > 0,
            showNavNext: !(idxCategory === endgameDatabase.count - 1 && idxSubcategory === idxLastSubcategory),
            rows: Math.ceil(subcategory.games.length / 6),
            showPrevious() {
                if (this.idxSubcategory > 0 || this.idxCategory > 0) {
                    this.idxSubcategory--;
                    if (this.idxSubcategory < 0) {
                        this.idxCategory--;
                        this.idxSubcategory = endgameDatabase.categories[this.idxCategory].count - 1;
                        this.idxLastSubcategory = this.idxSubcategory;
                        this.category =  endgameDatabase.categories[this.idxCategory];
                    }
                    this.subcategory =  this.category.subcategories[this.idxSubcategory];
                    this.gameCount = this.subcategory.games.length;
                    this.rows = Math.ceil(this.gameCount / 6);
                    this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0;
                    this.showNavNext = true;
                    this.title = `${window.AlpineI18n.t(`category.${this.category.name}`)} [ ${this.idxSubcategory + 1} / ${this.idxLastSubcategory + 1} ]`;
                    self.title = this.title;
                    self.seo = `${window.AlpineI18n.t(`category.${this.category.name}`)} (${this.subcategory.name}) ${this.idxSubcategory + 1}/${this.idxLastSubcategory + 1}`;
                    setupSEO('list.html', self.getSEOParams());
                    window.history.replaceState(this.title, this.title, `/chessendgametraining/#/chessendgametraining/list/${this.idxCategory}/${this.idxSubcategory}`);
                }
            },
            showNext() {
                if (!(this.idxCategory === endgameDatabase.count - 1 && this.idxSubcategory === this.idxLastSubcategory)) {
                    this.idxSubcategory++;
                    if (this.idxSubcategory > this.idxLastSubcategory) {
                        this.idxCategory++;
                        this.idxSubcategory = 0;
                        this.idxLastSubcategory = endgameDatabase.categories[this.idxCategory].count - 1;
                        this.category =  endgameDatabase.categories[this.idxCategory];
                    }
                    this.subcategory =  this.category.subcategories[this.idxSubcategory];
                    this.gameCount = this.subcategory.games.length;
                    this.rows = Math.ceil(this.gameCount / 6);
                    this.showNavPrev = true;
                    this.showNavNext = !(this.idxCategory === endgameDatabase.count - 1 && this.idxSubcategory === this.idxLastSubcategory);
                    this.title = `${window.AlpineI18n.t(`category.${this.category.name}`)} [ ${this.idxSubcategory + 1} / ${this.idxLastSubcategory + 1} ]`;
                    self.title = this.title;
                    self.seo = `${window.AlpineI18n.t(`category.${this.category.name}`)} (${this.subcategory.name}) ${this.idxSubcategory + 1}/${this.idxLastSubcategory + 1}`;
                    setupSEO('list.html', self.getSEOParams());
                    window.history.replaceState(this.title, this.title, `/chessendgametraining/#/chessendgametraining/list/${this.idxCategory}/${this.idxSubcategory}`);
                }
            },
            ariaDescriptionFromIcon: ariaDescriptionFromIcon,
            init() {
                endgameDatabaseService.endgameDatabaseChangedEmitter.addEventListener((database: EndgameDatabase) => {
                    const categories = database.categories;
                    this.category = clone(categories[idxCategory]);
                    this.subcategory = clone(this.category.subcategories[idxSubcategory]);
                });
            }
        }));
    }

    getSEOParams(): any {
        return { 'kind': this.seo };
    }

}

export const listController = new ListController();
