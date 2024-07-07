// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { Drivers, Storage } from '@ionic/storage';

class StorageService {
    private store = new Storage({ name: 'CET_STORAGE', driverOrder: [ Drivers.IndexedDB, Drivers.LocalStorage ] });

    public async init(): Promise<any> {
        return this.store.create();
    }

    public get(key: string) {
        return this.store.get(key);
    }
    
    public set(key: string, value: any) {
        return this.store.set(key, value);
    }
    
    public remove(key: string) {
        return this.store.remove(key);
    }

}

export const storageService = new StorageService();
