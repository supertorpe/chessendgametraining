import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { EndgameDatabase, Category, Subcategory } from '.';

@Injectable({
  providedIn: 'root',
})
export class EndgameDatabaseService {

  private endgameDatabase: EndgameDatabase;
    
  constructor(private http: HttpClient, private storage: Storage) {
  }

  initialize(): Promise<boolean> {
    return new Promise(resolve => {
      this.getLocalDatabase().then(localDatabase => {
        if (localDatabase == null) {
          this.getRemoteDatabase().then(remoteDatabase => {
            this.endgameDatabase = remoteDatabase;
            this.saveDatabase().then(saved => {
              resolve(true);
            });
          });
        } else {
          this.endgameDatabase = localDatabase;
          resolve(true);
        }
      });
    });
  }

  getLocalDatabase(): Promise<EndgameDatabase> {
    return this.storage.get('ENDGAME_DATABASE');
  }

  saveDatabase(): Promise<EndgameDatabase> {
    return this.storage.set('ENDGAME_DATABASE', this.endgameDatabase);
  }

  cleanDatabase(): Promise<EndgameDatabase> {
    return this.getRemoteDatabase().then(remoteDatabase => {
      this.endgameDatabase = remoteDatabase;
      return this.saveDatabase();
    });
  }

  getRemoteDatabase(): Promise<EndgameDatabase> {
    return this.http.get<EndgameDatabase>('../../assets/data/endgames.json').toPromise();
  }

  getDatabase() {
    return this.endgameDatabase;
  }

  findCategory(categoryName: string): Category {
    return this.endgameDatabase.categories.find(category => category.name === categoryName);
  }
  
  findSubcategory(category: Category, subcategoryName: string): Subcategory {
    return category.subcategories.find(subcategory => subcategory.name === subcategoryName);
  }
}
