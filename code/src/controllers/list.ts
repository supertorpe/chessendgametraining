// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { endgameDatabaseService, routeService } from '../services';
import { ariaDescriptionFromIcon, clone, setupSEO } from '../commons';
import { EndgameDatabase } from '../model';

class ListController extends BaseController {

    private title!: string;
    private seo!: string;
    // Properties to be used in Alpine data scope
    public idxCategory: number = 0;
    public idxSubcategory: number = 0;
    public idxLastSubcategory: number = 0;
    public category: any = null;
    public subcategory: any = null;
    public gameCount: number = 0;
    public rows: number = 0;

    onEnter($routeParams?: any): void {
        const self = this;
        const endgameDatabase = endgameDatabaseService.endgameDatabase;
        const categories = endgameDatabase.categories;
        this.idxCategory = parseInt($routeParams['idxCategory']);
        this.idxSubcategory = parseInt($routeParams['idxSubcategory']);
        this.category = (categories as any[])[this.idxCategory];
        this.subcategory = (this.category as any).subcategories[this.idxSubcategory];
        this.idxLastSubcategory = (this.category as any).count - 1;
        this.gameCount = (this.subcategory as any).games.length;
        this.rows = Math.ceil(this.gameCount / 6);

        this.title = `${window.AlpineI18n.t(`category.${(this.category as any).name}`)} [ ${this.idxSubcategory + 1} / ${this.idxLastSubcategory + 1} ]`;
        this.seo = `${window.AlpineI18n.t(`category.${(this.category as any).name}`)} (${(this.subcategory as any).name}) ${this.idxSubcategory + 1}/${this.idxLastSubcategory + 1}`;

        Alpine.data('info', () => ({
            title: self.title,
            idxCategory: self.idxCategory,
            idxSubcategory: self.idxSubcategory,
            category: self.category,
            subcategory: self.subcategory,
            gameCount: self.gameCount,
            idxLastSubcategory: self.idxLastSubcategory,
            showNavPrev: self.idxSubcategory > 0 || self.idxCategory > 0,
            showNavNext: !(self.idxCategory === endgameDatabase.count - 1 && self.idxSubcategory === self.idxLastSubcategory),
            rows: self.rows,
            // Calculate progress for the current subcategory
            getSolvedCount() {
                return (this.subcategory as any).games.filter((game: any) => game.record !== null && game.record >= 0).length;
            },
            getProgressPercentage() {
                if (this.gameCount === 0) return 0;
                return Math.round((this.getSolvedCount() / this.gameCount) * 100);
            },
            // Calculate difficulty for a position (1-5 stars)
            getDifficultyStars(record: number | undefined) {
                if (record === undefined || record < 0) return 0; // Not solved or failed
                // Assuming fewer moves mean higher difficulty
                // This logic might need adjustment based on actual difficulty distribution
                if (record <= 2) return 5;
                if (record <= 3) return 4;
                if (record <= 4) return 3;
                if (record <= 5) return 2;
                return 1;
            },
            showPrevious() {
                if (this.idxSubcategory > 0 || this.idxCategory > 0) {
                    this.idxSubcategory--;
                    if (this.idxSubcategory < 0) {
                        this.idxCategory--;
                        this.idxSubcategory = (endgameDatabase.categories as any[])[this.idxCategory].count - 1;
                        this.idxLastSubcategory = this.idxSubcategory;
                        this.category = (endgameDatabase.categories as any[])[this.idxCategory];
                    }
                    this.subcategory = ((this.category as any).subcategories as any[])[this.idxSubcategory];
                    this.gameCount = (this.subcategory as any).games.length;
                    this.rows = Math.ceil(this.gameCount / 6);
                    this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0;
                    this.showNavNext = true;
                    this.title = `${window.AlpineI18n.t(`category.${(this.category as any).name}`)} [ ${this.idxSubcategory + 1} / ${this.idxLastSubcategory + 1} ]`;
                    self.title = this.title;
                    self.seo = `${window.AlpineI18n.t(`category.${(this.category as any).name}`)} (${(this.subcategory as any).name}) ${this.idxSubcategory + 1}/${this.idxLastSubcategory + 1}`;
                    setupSEO('page-list.html', self.getSEOParams());
                    window.history.replaceState(this.title, this.title, `/list/${this.idxCategory}/${this.idxSubcategory}`);
                    this.$nextTick().then(() => { routeService.updatePageLinks(); });
                }
            },
            showNext() {
                if (!(this.idxCategory === (endgameDatabase as any).count - 1 && this.idxSubcategory === this.idxLastSubcategory)) {
                    this.idxSubcategory++;
                    if (this.idxSubcategory > this.idxLastSubcategory) {
                        this.idxCategory++;
                        this.idxSubcategory = 0;
                        this.idxLastSubcategory = (endgameDatabase.categories as any[])[this.idxCategory].count - 1;
                        this.category = (endgameDatabase.categories as any[])[this.idxCategory];
                    }
                    this.subcategory = ((this.category as any).subcategories as any[])[this.idxSubcategory];
                    this.gameCount = (this.subcategory as any).games.length;
                    this.rows = Math.ceil(this.gameCount / 6);
                    this.showNavPrev = true;
                    this.showNavNext = !(this.idxCategory === (endgameDatabase as any).count - 1 && this.idxSubcategory === this.idxLastSubcategory);
                    this.title = `${window.AlpineI18n.t(`category.${(this.category as any).name}`)} [ ${this.idxSubcategory + 1} / ${this.idxLastSubcategory + 1} ]`;
                    self.title = this.title;
                    self.seo = `${window.AlpineI18n.t(`category.${(this.category as any).name}`)} (${(this.subcategory as any).name}) ${this.idxSubcategory + 1}/${this.idxLastSubcategory + 1}`;
                    setupSEO('page-list.html', self.getSEOParams());
                    window.history.replaceState(this.title, this.title, `/list/${this.idxCategory}/${this.idxSubcategory}`);
                    this.$nextTick().then(() => { routeService.updatePageLinks(); });
                }
            },
            ariaDescriptionFromIcon: ariaDescriptionFromIcon,
            init() {
                endgameDatabaseService.endgameDatabaseChangedEmitter.addEventListener((database: EndgameDatabase) => {
                    const categories = database.categories;
                    this.category = clone((categories as any[])[self.idxCategory]);
                    this.subcategory = clone((this.category as any).subcategories[self.idxSubcategory]);
                });
            }
        }));
    }

    getSEOParams(): any {
        return { 'kind': this.seo };
    }

}

export const listController = new ListController();