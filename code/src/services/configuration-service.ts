import { Configuration, DEFAULT_CONFIG } from '../model';
import { storageService } from './storage-service';

class ConfigurationService {

    private _configuration!: Configuration;

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
                        config.boardTheme
                    );
                    resolve(this._configuration);
                } else {
                    this._configuration = DEFAULT_CONFIG;
                    this.save().then(cfg => {
                        resolve(cfg);
                    });
                }
            });
        });
    }

    public save(): Promise<Configuration> {
        return storageService.set('CONFIGURATION', this._configuration.serialize());
    }

}

export const configurationService = new ConfigurationService();
