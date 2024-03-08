import { EndgameDatabase, endgameDatabase } from '../model';
import { configurationService } from './configuration-service';
import { storageService } from './storage-service';
import { EventEmitter, textToImages, urlIcon } from '../commons';
import { themeSwitcherService } from './theme-switcher-service';

class EndgameDatabaseService {
    private _endgameDatabase!: EndgameDatabase;
    private _endgameDatabaseChangedEmitter: EventEmitter<EndgameDatabase> = new EventEmitter<EndgameDatabase>();

    get endgameDatabase(): EndgameDatabase { return this._endgameDatabase; }
    get endgameDatabaseChangedEmitter(): EventEmitter<EndgameDatabase> { return this._endgameDatabaseChangedEmitter; }

    public async init(): Promise<boolean> {
        return new Promise(resolve => {
            this.getLocalDatabase().then((localDatabase: EndgameDatabase) => {
                this._endgameDatabase = this.reconcileDatabases(localDatabase, endgameDatabase);
                this.enrich(this.endgameDatabase, configurationService.configuration.pieceTheme);
                configurationService.configuration.configurationChangedEmitter.addEventListener((event) => {
                    if (event.field == 'pieceTheme') this.enrich(this.endgameDatabase, event.config.pieceTheme);
                });
                /////////////// TO DO: eliminar esto, es para el sitemap.xml
                /*
                this._endgameDatabase.categories.forEach( (category, idxCategory) => {
                    category.subcategories.forEach((subcategory, idxSubcategory) => {
                        console.log(`<url><loc>https://server.mydomain.local:5173/chess-endgame-training/list/${idxCategory}/${idxSubcategory}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>`);
                        subcategory.games.forEach((_position, idxPosition) => {
                            console.log(`<url><loc>https://server.mydomain.local:5173/chess-endgame-training/position/${idxCategory}/${idxSubcategory}/${idxPosition}</loc><priority>0.6</priority><changefreq>weekly</changefreq></url>`);
                        });
                    });
                });
                */
                //////////////
                resolve(true);
            });
        });
    }

    private getLocalDatabase(): Promise<EndgameDatabase> {
        return storageService.get('ENDGAME_DATABASE');
    }

    private enrich(database: EndgameDatabase, pieceTheme: string) {
        const color = themeSwitcherService.currentTheme() == 'dark' ? 'w' : 'b';
        database.count = database.categories.length;
        database.categories.forEach(category => {
          category.count = category.subcategories.length;
          category.iconUrls = [];
          category.icons.forEach(icon => category.iconUrls.push(urlIcon(`${color}${icon}`, pieceTheme)));
          category.subcategories.forEach(subcategory => {
            subcategory.count = subcategory.games.length;
            subcategory.images = textToImages(subcategory.name);
            subcategory.imageUrls = [];
            subcategory.images.forEach(image => subcategory.imageUrls.push(urlIcon(image, pieceTheme)));
          });
        });
        this._endgameDatabaseChangedEmitter.notify(database);
    }

    private reconcileDatabases(localDatabase: EndgameDatabase, defaultDatabase: EndgameDatabase): EndgameDatabase {
        if (!localDatabase) {
            storageService.set('ENDGAME_DATABASE', defaultDatabase);
            return defaultDatabase;
        }
        if (localDatabase.version && localDatabase.version === defaultDatabase.version) {
            return localDatabase;
        }
        // recover records
        defaultDatabase.categories.forEach(category => {
            category.subcategories.forEach(subcategory => {
                subcategory.games.forEach(game => {
                    const localCategory = localDatabase.categories.find(x => x.name === category.name);
                    if (localCategory) {
                        const localSubcategory = localCategory.subcategories.find(x => x.name === subcategory.name);
                        if (localSubcategory) {
                            const localGame = localSubcategory.games.find(x => x.fen === game.fen);
                            if (localGame && localGame.record) {
                                game.record = localGame.record;
                            }
                        }
                    }
                });
            });
        });
        storageService.set('ENDGAME_DATABASE', defaultDatabase);
        return defaultDatabase;
    }
}

export const endgameDatabaseService = new EndgameDatabaseService();