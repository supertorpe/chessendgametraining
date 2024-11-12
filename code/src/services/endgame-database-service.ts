// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { EndgameDatabase, Position, endgameDatabase, isEndgameDatabase } from '../model';
import { configurationService } from './configuration-service';
import { storageService } from './storage-service';
import { EventEmitter, GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_FILE, textToImages, urlIcon, GOOGLE_DRIVE_DATABASE_TIMESTAMP_FILE } from '../commons';
import { themeSwitcherService } from './theme-switcher-service';
import { googleDriveService } from './google-drive-service';
import { showToast } from './toast-service';

class EndgameDatabaseService {
    private _endgameDatabase!: EndgameDatabase;
    private _endgameDatabaseChangedEmitter: EventEmitter<EndgameDatabase> = new EventEmitter<EndgameDatabase>();

    get endgameDatabase(): EndgameDatabase { return this._endgameDatabase; }
    get endgameDatabaseChangedEmitter(): EventEmitter<EndgameDatabase> { return this._endgameDatabaseChangedEmitter; }

    public async init(): Promise<boolean> {
        return new Promise(async resolve => {
            const localDatabase: EndgameDatabase = await this.getLocalDatabase();
            let remoteDatabase: EndgameDatabase | undefined;

            if (configurationService.configuration.syncGoogleDrive) {
                let loadRemoteDatabase = true;
                try {
                    const timestampFile = await googleDriveService.getFile<any>(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_TIMESTAMP_FILE);
                    if (timestampFile.timestamp == localDatabase.timestamp) {
                        remoteDatabase = localDatabase;
                        loadRemoteDatabase = false;
                    }
                } catch (error) {
                    console.log(error);
                }
                if (loadRemoteDatabase) {
                    try {
                        remoteDatabase = await googleDriveService.getFile<EndgameDatabase>(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_FILE);
                        showToast('app.database-sync-google-drive', 'top', 'success', 2000);
                    } catch (error) {
                        console.log(error);
                        remoteDatabase = undefined;
                    }
                }
            }
            this.reconcileDatabases(localDatabase, remoteDatabase, endgameDatabase);
            this.enrich(this.endgameDatabase, configurationService.configuration.pieceTheme);
            configurationService.configuration.configurationChangedEmitter.addEventListener((event) => {
                if (event.field == 'pieceTheme') this.enrich(this.endgameDatabase, event.config.pieceTheme);
            });
            configurationService.configuration.configurationChangedEmitter.addEventListener(async (event) => {
                switch (event.field) {
                    case 'pieceTheme':
                    case 'colorTheme': this.enrich(this.endgameDatabase, event.config.pieceTheme); break;
                    case 'syncGoogleDrive': {
                        if (event.config.syncGoogleDrive) {
                            const localDatabase: EndgameDatabase = await this.getLocalDatabase();
                            let loadRemoteDatabase = true;
                            try {
                                const timestampFile = await googleDriveService.getFile<any>(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_TIMESTAMP_FILE);
                                if (timestampFile.timestamp == localDatabase.timestamp) {
                                    remoteDatabase = localDatabase;
                                    loadRemoteDatabase = false;
                                }
                            } catch (error) {
                                console.log(error);
                            }
                            if (loadRemoteDatabase) {
                                try {
                                    showToast('app.database-loading-google-drive', 'top', 'success', 2000);
                                    remoteDatabase = await googleDriveService.getFile<EndgameDatabase>(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_FILE);
                                    showToast('app.database-sync-google-drive', 'top', 'success', 2000);
                                } catch (error) {
                                    console.log(error);
                                    remoteDatabase = undefined;
                                }
                                if (remoteDatabase) {
                                    this.reconcileDatabases(localDatabase, remoteDatabase, endgameDatabase);
                                    this._endgameDatabaseChangedEmitter.notify(this._endgameDatabase);
                                } else {
                                    googleDriveService.putFile(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_TIMESTAMP_FILE, { timestamp: localDatabase.timestamp })
                                    googleDriveService.putFile<EndgameDatabase>(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_FILE, localDatabase)
                                    .then(() => {
                                        showToast('app.database-sync-google-drive', 'top', 'success', 2000);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        //showToast('app.database-sync-google-drive-ko', 'top', 'warning', 2000);
                                    })
                                }
                            }
                        }
                        break;
                    }
                }
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
    }

    private getLocalDatabase(): Promise<EndgameDatabase> {
        return storageService.get('ENDGAME_DATABASE');
    }

    public save(): Promise<EndgameDatabase> {
        return new Promise<EndgameDatabase>((resolve) => {
            const promises: Promise<any>[] = [];
            this._endgameDatabase.timestamp = Date.now();
            promises.push(storageService.set('ENDGAME_DATABASE', this._endgameDatabase));
            if (configurationService.configuration.syncGoogleDrive) {
                promises.push(googleDriveService.putFile(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_TIMESTAMP_FILE, { timestamp: this._endgameDatabase.timestamp }));
                promises.push(googleDriveService.putFile(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_DATABASE_FILE, this._endgameDatabase));
            }
            Promise.all(promises)
            .then(() => {
                resolve(this._endgameDatabase);
                if (configurationService.configuration.syncGoogleDrive) {
                    showToast('app.database-sync-google-drive', 'top', 'success', 2000);
                }
            })
            .catch((error) => {
                console.log(error);
                resolve(this._endgameDatabase);
                if (configurationService.configuration.syncGoogleDrive) {
                    //showToast('app.database-sync-google-drive-ko', 'top', 'warning', 2000);
                }
            });
        });
    }

    public exportData() {
        const jsonString = JSON.stringify(this._endgameDatabase);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        document.body.appendChild(link);
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'chess-endgame-training.json');
        link.click();
        URL.revokeObjectURL(url);
    }

    public importData(data: EndgameDatabase): Promise<EndgameDatabase> {
        if (isEndgameDatabase(data)) {
            this._endgameDatabase = data;
            this._endgameDatabaseChangedEmitter.notify(this._endgameDatabase);
            return this.save();
        } else {
            throw new Error('Invalid data');
        }
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

    private findGameByFen(data: EndgameDatabase, targetFen: string): Position | undefined {
        for (const category of data.categories) {
            for (const subcategory of category.subcategories) {
                const game = subcategory.games.find(game => game.fen === targetFen);
                if (game) {
                    return game;
                }
            }
        }
        return undefined;
    }

    private reconcileDatabases(localDatabase: EndgameDatabase, remoteDatabase: EndgameDatabase | undefined, defaultDatabase: EndgameDatabase) {
        if (!localDatabase && !remoteDatabase) {
            storageService.set('ENDGAME_DATABASE', defaultDatabase);
            this._endgameDatabase = defaultDatabase;
            return;
        }
        if (localDatabase && localDatabase.version && localDatabase.version === defaultDatabase.version &&
            remoteDatabase && remoteDatabase.version && remoteDatabase.version === defaultDatabase.version &&
            localDatabase.timestamp == remoteDatabase.timestamp) {
            this._endgameDatabase = localDatabase;
            return;
        }
        // recover records
        defaultDatabase.categories.forEach(category => {
            category.subcategories.forEach(subcategory => {
                subcategory.games.forEach(game => {
                    const localGame = this.findGameByFen(localDatabase, game.fen);
                    const remoteGame = remoteDatabase ? this.findGameByFen(remoteDatabase, game.fen) : undefined;
                    const localRecord = localGame?.record;
                    const remoteRecord = remoteGame?.record;
                    if (localRecord != undefined && remoteRecord != undefined) {
                        const minValue = Math.min(localRecord, remoteRecord);
                        const maxValue = Math.max(localRecord, remoteRecord);
                        if (minValue == -1) game.record = maxValue;
                        else game.record = minValue;
                    } else if (localRecord != undefined) {
                        game.record = localRecord;
                    } else if (remoteRecord != undefined) {
                        game.record = remoteRecord;
                    }
                });
            });
        });
        this._endgameDatabase = defaultDatabase;
        this.save();
    }
}

export const endgameDatabaseService = new EndgameDatabaseService();
