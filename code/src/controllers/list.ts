import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { endgameDatabaseService } from '../services';
import { ariaDescriptionFromIcon, clone } from '../commons';
import { EndgameDatabase } from '../model';

class ListController extends BaseController {

    private title!: string;
    private seo!: string;

    onEnter($routeParams?: any): void {
        const endgameDatabase = endgameDatabaseService.endgameDatabase;
        let categories = endgameDatabase.categories;
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
            prevUrl: '',
            nextUrl: '',
            rows: Math.ceil(subcategory.games.length / 6),
            showPosition(idxGame: Number) {
                console.log(idxGame);
            },
            ariaDescriptionFromIcon: ariaDescriptionFromIcon,
            init() {
                endgameDatabaseService.endgameDatabaseChangedEmitter.addEventListener((database: EndgameDatabase) => {
                    const categories = database.categories;
                    this.category = clone(categories[idxCategory]);
                    this.subcategory = clone(this.category.subcategories[idxSubcategory]);
                });
                // prevUrl
                if (idxSubcategory > 0 || idxCategory > 0) {
                    let idxCat = this.idxCategory;
                    let idxSub = this.idxSubcategory - 1;
                    if (idxSub < 0) {
                      idxCat--;
                      idxSub = endgameDatabase.categories[idxCat].count - 1;
                    }
                    this.prevUrl = `/list/${idxCat}/${idxSub}`;
                }
                // nextUrl
                if (!(idxCategory === endgameDatabase.count - 1 && idxSubcategory === idxLastSubcategory)) {
                    let idxCat = this.idxCategory;
                    let idxSub = this.idxSubcategory + 1;
                    if (idxSub > this.idxLastSubcategory) {
                      idxCat++;
                      idxSub = 0;
                    }
                    this.nextUrl = `/list/${idxCat}/${idxSub}`;
                }
            }
        }));
    }

    getSEOParams(): any {
        return { 'kind': this.seo };
    }

}

export const listController = new ListController();
