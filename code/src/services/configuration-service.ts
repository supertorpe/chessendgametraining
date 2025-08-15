// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { Configuration, ConfigurationChangedEvent, DEFAULT_CONFIG } from '../model';
import { storageService } from './storage-service';
import { googleDriveService } from './google-drive-service';
import { GOOGLE_DRIVE_CONFIG_FILE, GOOGLE_DRIVE_FOLDER } from '../commons';

class ConfigurationService {

    private _configuration!: Configuration;
    private loadingFromGoogleDrive = false;

    get configuration(): Configuration { return this._configuration; }

    constructor() { }

    public init(): Promise<Configuration> {
        return new Promise<Configuration>(resolve => {
            storageService.get('CONFIGURATION').then((config: Partial<Configuration>) => {
                if (config) {
                    if (config.useSyzygy === undefined) config.useSyzygy = DEFAULT_CONFIG.useSyzygy;
                    if (config.threeFoldRepetitionCheck === undefined) config.threeFoldRepetitionCheck = DEFAULT_CONFIG.threeFoldRepetitionCheck;
                    if (config.stockfishDepth === undefined) config.stockfishDepth = DEFAULT_CONFIG.stockfishDepth;
                    if (config.stockfishMovetime === undefined) config.stockfishMovetime = DEFAULT_CONFIG.stockfishMovetime;
                    if (config.automaticShowFirstPosition === undefined) config.automaticShowFirstPosition = DEFAULT_CONFIG.automaticShowFirstPosition;
                    if (config.automaticShowNextPosition === undefined) config.automaticShowNextPosition = DEFAULT_CONFIG.automaticShowNextPosition;
                    if (config.solveTrivialPosition === undefined) config.solveTrivialPosition = DEFAULT_CONFIG.solveTrivialPosition;
                    if (config.preventScreenOff === undefined) config.preventScreenOff = DEFAULT_CONFIG.preventScreenOff;
                    if (config.colorTheme === undefined) config.colorTheme = DEFAULT_CONFIG.colorTheme;
                    if (config.playSounds === undefined) config.playSounds = DEFAULT_CONFIG.playSounds;
                    if (config.fullScreen === undefined) config.fullScreen = DEFAULT_CONFIG.fullScreen;
                    if (config.highlightSquares === undefined) config.highlightSquares = DEFAULT_CONFIG.highlightSquares;
                    if (config.pieceTheme === undefined) config.pieceTheme = DEFAULT_CONFIG.pieceTheme;
                    if (config.boardTheme === undefined) config.boardTheme = DEFAULT_CONFIG.boardTheme;
                    if (config.syncGoogleDrive === undefined) config.syncGoogleDrive = DEFAULT_CONFIG.syncGoogleDrive;
                    if (config.changelog === undefined) config.changelog = DEFAULT_CONFIG.changelog;
                    if (config.language === undefined) config.language = DEFAULT_CONFIG.language;
                    if (config.reducedMotion === undefined) config.reducedMotion = DEFAULT_CONFIG.reducedMotion;
                    if (config.highContrast === undefined) config.highContrast = DEFAULT_CONFIG.highContrast;
                    if (config.screenReaderAnnouncements === undefined) config.screenReaderAnnouncements = DEFAULT_CONFIG.screenReaderAnnouncements;
                    this._configuration = new Configuration(
                        config.useSyzygy,
                        config.threeFoldRepetitionCheck,
                        config.stockfishDepth,
                        config.stockfishMovetime,
                        config.automaticShowFirstPosition,
                        config.automaticShowNextPosition,
                        config.solveTrivialPosition,
                        config.preventScreenOff,
                        config.colorTheme,
                        config.playSounds,
                        config.fullScreen,
                        config.highlightSquares,
                        config.pieceTheme,
                        config.boardTheme,
                        config.syncGoogleDrive,
                        config.changelog,
                        config.language,
                        config.reducedMotion,
                        config.highContrast,
                        config.screenReaderAnnouncements
                    );
                    this._configuration.configurationChangedEmitter.addEventListener((event: ConfigurationChangedEvent) => this.configurationChanged(event));
                    if (this._configuration.syncGoogleDrive) {
                        this.loadFromGoogleDrive()
                            .then(() => resolve(this._configuration))
                            .catch((error) => {
                                console.log(error);
                                resolve(this._configuration);
                            }
                            );
                    } else {
                        resolve(this._configuration);
                    }
                } else {
                    this._configuration = DEFAULT_CONFIG;
                    this._configuration.configurationChangedEmitter.addEventListener((event: ConfigurationChangedEvent) => this.configurationChanged(event));
                    this.save().then(cfg => {
                        resolve(cfg);
                    });
                }
            });
        });
    }

    private configurationChanged(event: ConfigurationChangedEvent) {
        switch (event.field) {
            case 'syncGoogleDrive': {
                if (!this.loadingFromGoogleDrive && event.config.syncGoogleDrive) {
                    this.loadFromGoogleDrive();
                }
                break;
            }
        }
    };

    private loadFromGoogleDrive(): Promise<Configuration> {
        return new Promise<Configuration>((resolve, reject) => {
            const self = this;
            googleDriveService.getFile<Configuration>(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_CONFIG_FILE)
                .then((remoteConfig) => {
                    self.loadingFromGoogleDrive = true;
                    if ('useSyzygy' in remoteConfig) self._configuration.useSyzygy = remoteConfig.useSyzygy;
                    if ('threeFoldRepetitionCheck' in remoteConfig) self._configuration.threeFoldRepetitionCheck = remoteConfig.threeFoldRepetitionCheck;
                    if ('stockfishDepth' in remoteConfig) self._configuration.stockfishDepth = remoteConfig.stockfishDepth;
                    if ('stockfishMovetime' in remoteConfig) self._configuration.stockfishMovetime = remoteConfig.stockfishMovetime;
                    if ('automaticShowFirstPosition' in remoteConfig) self._configuration.automaticShowFirstPosition = remoteConfig.automaticShowFirstPosition;
                    if ('automaticShowNextPosition' in remoteConfig) self._configuration.automaticShowNextPosition = remoteConfig.automaticShowNextPosition;
                    if ('preventScreenOff' in remoteConfig) self._configuration.preventScreenOff = remoteConfig.preventScreenOff;
                    if ('colorTheme' in remoteConfig) self._configuration.colorTheme = remoteConfig.colorTheme;
                    if ('playSounds' in remoteConfig) self._configuration.playSounds = remoteConfig.playSounds;
                    if ('fullScreen' in remoteConfig) self._configuration.fullScreen = remoteConfig.fullScreen;
                    if ('highlightSquares' in remoteConfig) self._configuration.highlightSquares = remoteConfig.highlightSquares;
                    if ('pieceTheme' in remoteConfig) self._configuration.pieceTheme = remoteConfig.pieceTheme;
                    if ('boardTheme' in remoteConfig) self._configuration.boardTheme = remoteConfig.boardTheme;
                    if ('syncGoogleDrive' in remoteConfig) self._configuration.syncGoogleDrive = remoteConfig.syncGoogleDrive;
                    if ('changelog' in remoteConfig) self._configuration.changelog = remoteConfig.changelog;
                    if ('language' in remoteConfig) self._configuration.language = remoteConfig.language;
                    self.loadingFromGoogleDrive = false;
                    storageService.set('CONFIGURATION', this._configuration.serialize());
                    resolve(remoteConfig);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    public save(): Promise<Configuration> {
        return new Promise<Configuration>((resolve) => {
            const promises: Promise<any>[] = [];
            if (this._configuration.syncGoogleDrive) {
                promises.push(googleDriveService.putFile(GOOGLE_DRIVE_FOLDER, GOOGLE_DRIVE_CONFIG_FILE, this._configuration.serialize()));
            }
            promises.push(storageService.set('CONFIGURATION', this._configuration.serialize()));
            Promise.all(promises).then(() => resolve(this._configuration));
        });
    }

}

export const configurationService = new ConfigurationService();
