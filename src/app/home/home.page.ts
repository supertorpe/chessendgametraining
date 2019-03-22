import { Component } from '@angular/core';
import { EndgameDatabaseService, EndgameDatabase } from '../shared';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public endgameDatabase$: Observable<EndgameDatabase>;
  public endgameDatabase: EndgameDatabase;

  constructor(
    private endgameDatabaseService: EndgameDatabaseService) {
  }

  ngOnInit() {
    this.endgameDatabaseService.initialize().then(() => {
      this.endgameDatabase = this.endgameDatabaseService.getDatabase();
      this.endgameDatabase$ = of(this.endgameDatabase);
    });
  }

}
