import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { EndgameDatabase, Category, Subcategory } from './model';
import { MiscService } from './misc.service';
import { ConfigurationService } from './configuration.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EndgameDatabaseService {

  private endgameDatabase: EndgameDatabase;
  private onConfigChangeSubscription: Subscription;
    
  constructor(private http: HttpClient, private storage: Storage, private miscService: MiscService, private configurationService: ConfigurationService) {
    this.onConfigChangeSubscription = this.configurationService.onChange$.subscribe(event => this.configurationChanged(event));
  }

  initialize(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.endgameDatabase) {
        resolve(true);
        return;
      }
      Promise.all([
        this.configurationService.initialize(),
        this.getLocalDatabase(),
        this.getRemoteDatabase()
      ]).then((values) => {
        const config = values[0];
        const localDatabase = values[1];
        const remoteDatabase = values[2];
        this.endgameDatabase = this.reconcileDatabases(localDatabase, remoteDatabase);
        this.enrich(this.endgameDatabase, config.pieceTheme);
        resolve(true);
      });
    });
  }

  public enrich(database: EndgameDatabase, pieceTheme: string) {
    database.count = database.categories.length;
    database.categories.forEach(category => {
      category.count = category.subcategories.length;
      category.iconUrls = [];
      category.icons.forEach(icon => category.iconUrls.push(this.miscService.urlIcon(icon, pieceTheme)));
      category.subcategories.forEach(subcategory => {
        subcategory.count = subcategory.games.length;
        subcategory.images = this.miscService.textToImages(subcategory.name);
        subcategory.imageUrls = [];
        subcategory.images.forEach(image => subcategory.imageUrls.push(this.miscService.urlIcon(image, pieceTheme)));
      });
    });
  }

  private configurationChanged(config) {
    this.enrich(this.endgameDatabase, config.pieceTheme);
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
