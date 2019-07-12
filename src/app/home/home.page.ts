import { Component } from '@angular/core';
import { EndgameDatabaseService, EndgameDatabase, ConfigurationService, Configuration, MiscService } from '../shared';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  private config: Configuration;
  public endgameDatabase$: Observable<EndgameDatabase>;
  public endgameDatabase: EndgameDatabase;

  constructor(
    private configurationService: ConfigurationService,
    private miscService: MiscService,
    private endgameDatabaseService: EndgameDatabaseService) {
      this.configurationService.initialize().then(config => {
        this.config = config;
      });
  }

  ngOnInit() {
    this.endgameDatabaseService.initialize().then(() => {
      this.endgameDatabase = this.endgameDatabaseService.getDatabase();
      this.endgameDatabase$ = of(this.endgameDatabase);
    });
  }

  trackFunc(index: number, obj: any) {
    return index;
  }
  
}
