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
        stockfishDepth: 28
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
