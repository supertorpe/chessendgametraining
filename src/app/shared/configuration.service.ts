import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Configuration } from './model';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {

    private configuration: Configuration;

    private DEFAULT_CONFIG : Configuration = {
        useSyzygy: true,
        stockfishDepth: 28,
        automaticShowFirstPosition: true,
        preventScreenOff: true,
        colorTheme: 'dark',
        playSounds: true
    };

    constructor(private storage: Storage) {
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
      }


}
