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
      if (this.endgameDatabase) {
        resolve(true);
        return;
      }
      Promise.all([
        this.getLocalDatabase(),
        this.getRemoteDatabase()
      ]).then((values: EndgameDatabase[]) => {
        const localDatabase = values[0];
        const remoteDatabase = values[1];
        this.endgameDatabase = this.reconcileDatabases(localDatabase, remoteDatabase);
        resolve(true);
      });
    });
  }

  private reconcileDatabases(localDatabase: EndgameDatabase, remoteDatabase: EndgameDatabase) : EndgameDatabase {
    if (!localDatabase) {
          this.storage.set('ENDGAME_DATABASE', remoteDatabase);
          return remoteDatabase;
    }
    if (localDatabase.version && localDatabase.version === remoteDatabase.version) {
      return localDatabase;
    }
    // recover records
    remoteDatabase.categories.forEach(category => {
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
	this.storage.set('ENDGAME_DATABASE', remoteDatabase);
    return remoteDatabase;
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
