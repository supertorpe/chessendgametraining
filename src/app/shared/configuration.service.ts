import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Configuration } from './model';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {

    private configuration: Configuration;

    private onChange: Subject<Configuration>;
    public onChange$: Observable<Configuration>;

    private DEFAULT_CONFIG: Configuration = {
        useSyzygy: true,
        stockfishDepth: 28,
        automaticShowFirstPosition: true,
        preventScreenOff: true,
        colorTheme: 'dark',
        playSounds: true,
        fullScreen: true,
        highlightSquares: true,
        pieceTheme: 'cburnett',
        boardTheme: 'brown'
    };

    constructor(private storage: Storage) {
        this.onChange = new Subject<Configuration>();
        this.onChange$ = this.onChange.asObservable();
    }

    initialize(): Promise<Configuration> {
        return new Promise(resolve => {
            if (this.configuration) {
                resolve(this.configuration);
                return;
            }
            this.storage.get('CONFIGURATION').then(config => {
                if (config) {
                    if (config.useSyzygy === undefined) config.useSyzygy = this.DEFAULT_CONFIG.useSyzygy;
                    if (config.stockfishDepth === undefined) config.stockfishDepth = this.DEFAULT_CONFIG.stockfishDepth;
                    if (config.automaticShowFirstPosition === undefined) config.automaticShowFirstPosition = this.DEFAULT_CONFIG.automaticShowFirstPosition;
                    if (config.preventScreenOff === undefined) config.preventScreenOff = this.DEFAULT_CONFIG.preventScreenOff;
                    if (config.colorTheme === undefined) config.colorTheme = this.DEFAULT_CONFIG.colorTheme;
                    if (config.playSounds === undefined) config.playSounds = this.DEFAULT_CONFIG.playSounds;
                    if (config.fullScreen === undefined) config.fullScreen = this.DEFAULT_CONFIG.fullScreen;
                    if (config.highlightSquares === undefined) config.highlightSquares = this.DEFAULT_CONFIG.highlightSquares;
                    if (config.pieceTheme === undefined) config.pieceTheme = this.DEFAULT_CONFIG.pieceTheme;
                    if (config.boardTheme === undefined) config.boardTheme = this.DEFAULT_CONFIG.boardTheme;
                    this.configuration = config;
                    resolve(this.configuration);
                } else {
                    this.configuration = this.DEFAULT_CONFIG;
                    this.save().then(cfg => {
                        resolve(cfg);
                    });
                }
            });
        });
    }

    save(): Promise<Configuration> {
        return this.storage.set('CONFIGURATION', this.configuration);
        /*
        return new Promise(resolve => {
            this.storage.set('CONFIGURATION', this.configuration).then(function (result) {
                this.onChange.next(true);
                resolve(result);
            });
        });
        */
    }

    notifyChanges(configuration: Configuration) {
        if (!configuration) {
            configuration = this.configuration;
        }
        this.onChange.next(configuration);
    }

}
