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
            storageService.get('CONFIGURATION').then(config => {
                if (config) {
                    if (config.useSyzygy === undefined) config.useSyzygy = DEFAULT_CONFIG.useSyzygy;
                    if (config.stockfishDepth === undefined) config.stockfishDepth = DEFAULT_CONFIG.stockfishDepth;
                    if (config.stockfishMovetime === undefined) config.stockfishMovetime = DEFAULT_CONFIG.stockfishMovetime;
                    if (config.automaticShowFirstPosition === undefined) config.automaticShowFirstPosition = DEFAULT_CONFIG.automaticShowFirstPosition;
                    if (config.preventScreenOff === undefined) config.preventScreenOff = DEFAULT_CONFIG.preventScreenOff;
                    if (config.colorTheme === undefined) config.colorTheme = DEFAULT_CONFIG.colorTheme;
                    if (config.playSounds === undefined) config.playSounds = DEFAULT_CONFIG.playSounds;
                    if (config.fullScreen === undefined) config.fullScreen = DEFAULT_CONFIG.fullScreen;
                    if (config.highlightSquares === undefined) config.highlightSquares = DEFAULT_CONFIG.highlightSquares;
                    if (config.pieceTheme === undefined) config.pieceTheme = DEFAULT_CONFIG.pieceTheme;
                    if (config.boardTheme === undefined) config.boardTheme = DEFAULT_CONFIG.boardTheme;
                    if (config.syncGoogleDrive === undefined) config.syncGoogleDrive = DEFAULT_CONFIG.syncGoogleDrive;
                    this._configuration = new Configuration(
                        config.useSyzygy,
                        config.stockfishDepth,
                        config.stockfishMovetime,
                        config.automaticShowFirstPosition,
                        config.preventScreenOff,
                        config.colorTheme,
                        config.playSounds,
                        config.fullScreen,
                        config.highlightSquares,
                        config.pieceTheme,
                        config.boardTheme,
                        config.syncGoogleDrive
                    );
                    this._configuration.configurationChangedEmitter.addEventListener((event: ConfigurationChangedEvent) => this.configurationChanged(event));
                    if (this._configuration.syncGoogleDrive) {
                        this.loadFromGoogleDrive();
                    }
                    resolve(this._configuration);
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

    private loadFromGoogleDrive() {
        const self = this;
        googleDriveService.init().then((token) => {
            console.log(`GOOGLE TOKEN: ${token}`);
            if (token) {
                googleDriveService.findFolder(GOOGLE_DRIVE_FOLDER).then((folderId) => {
                    if (folderId) {
                        googleDriveService.findFile(GOOGLE_DRIVE_CONFIG_FILE, folderId).then((fileId) => {
                            if (fileId) {
                                googleDriveService.getFileContent(fileId).then((fileContent) => {
                                    if (fileContent) {
                                        const remoteConfig = JSON.parse(fileContent);
                                        self.loadingFromGoogleDrive = true;
                                        if ('useSyzygy' in remoteConfig) self._configuration.useSyzygy = remoteConfig.useSyzygy;
                                        if ('stockfishDepth' in remoteConfig) self._configuration.stockfishDepth = remoteConfig.stockfishDepth;
                                        if ('stockfishMovetime' in remoteConfig) self._configuration.stockfishMovetime = remoteConfig.stockfishMovetime;
                                        if ('automaticShowFirstPosition' in remoteConfig) self._configuration.automaticShowFirstPosition = remoteConfig.automaticShowFirstPosition;
                                        if ('preventScreenOff' in remoteConfig) self._configuration.preventScreenOff = remoteConfig.preventScreenOff;
                                        if ('colorTheme' in remoteConfig) self._configuration.colorTheme = remoteConfig.colorTheme;
                                        if ('playSounds' in remoteConfig) self._configuration.playSounds = remoteConfig.playSounds;
                                        if ('fullScreen' in remoteConfig) self._configuration.fullScreen = remoteConfig.fullScreen;
                                        if ('highlightSquares' in remoteConfig) self._configuration.highlightSquares = remoteConfig.highlightSquares;
                                        if ('pieceTheme' in remoteConfig) self._configuration.pieceTheme = remoteConfig.pieceTheme;
                                        if ('boardTheme' in remoteConfig) self._configuration.boardTheme = remoteConfig.boardTheme;
                                        if ('syncGoogleDrive' in remoteConfig) self._configuration.syncGoogleDrive = remoteConfig.syncGoogleDrive;
                                        self.loadingFromGoogleDrive = false;
                                    }
                                });
                            }
                        });
                    }
                })
                googleDriveService.createFolderIfNotExists(GOOGLE_DRIVE_FOLDER).then((folderId) => {
                    googleDriveService.uploadJsonToFolder(this._configuration.serialize(), GOOGLE_DRIVE_CONFIG_FILE, folderId);
                });
            }
        });
    }

    public save(): Promise<Configuration> {
        if (this._configuration.syncGoogleDrive) {
            googleDriveService.init().then((token) => {
                console.log(`GOOGLE TOKEN: ${token}`);
                if (token) {
                    googleDriveService.createFolderIfNotExists(GOOGLE_DRIVE_FOLDER).then((folderId) => {
                        googleDriveService.uploadJsonToFolder(this._configuration.serialize(), GOOGLE_DRIVE_CONFIG_FILE, folderId);
                    });
                }
            });

        }
        return storageService.set('CONFIGURATION', this._configuration.serialize());
    }

}

export const configurationService = new ConfigurationService();
