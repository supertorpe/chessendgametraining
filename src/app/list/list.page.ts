import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EndgameDatabaseService, EndgameDatabase, Category, Subcategory, MiscService } from '../shared';
import { Observable, of } from 'rxjs';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  public endgameDatabase: EndgameDatabase;
  public idxCategory: number;
  public idxSubcategory: number;
  public idxLastSubcategory: number;
  public showNavPrev = false;
  public showNavNext = false;
  public category$: Observable<Category>;
  public subcategory$: Observable<Subcategory>;
  public idx = 1;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private navCtrl: NavController,
    private endgameDatabaseService: EndgameDatabaseService,
    private miscService: MiscService) {
  }

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.idxCategory = +params.idxcategory;
      this.idxSubcategory = +params.idxsubcategory;
      this.endgameDatabaseService.initialize().then(result => {
        this.endgameDatabase = this.endgameDatabaseService.getDatabase();
        this.load();
      });
    });
  }

  load() {
    const cat = this.endgameDatabase.categories[this.idxCategory];
    const subcat = cat.subcategories[this.idxSubcategory];
    subcat.images = this.miscService.textToImages(subcat.name);
    this.category$ = of(cat);
    this.subcategory$ = of(subcat);
    this.idxLastSubcategory = this.endgameDatabase.categories[this.idxCategory].subcategories.length - 1;
    this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0;
    this.showNavNext = !(this.idxCategory === this.endgameDatabase.categories.length - 1 && this.idxSubcategory === this.idxLastSubcategory);
  }
  
  gotoPrev() {
    let idxCat = this.idxCategory;
    let idxSub = this.idxSubcategory - 1;
    if (idxSub < 0) {
      idxCat--;
      idxSub = this.endgameDatabase.categories[idxCat].subcategories.length - 1;
    }
    //this.navCtrl.navigateRoot('/list/'+ idxCat + '/' + idxSub);
    this.idxCategory = idxCat;
    this.idxSubcategory = idxSub;
    this.location.go('/list/'+ idxCat + '/' + idxSub);
    this.load();
  }

  gotoNext() {
    let idxCat = this.idxCategory;
    let idxSub = this.idxSubcategory + 1;
    if (idxSub > this.idxLastSubcategory) {
      idxCat++;
      idxSub = 0;
    }
    //this.navCtrl.navigateRoot('/list/'+ idxCat + '/' + idxSub);
    this.idxCategory = idxCat;
    this.idxSubcategory = idxSub;
    this.location.go('/list/'+ idxCat + '/' + idxSub);
    this.load();
  }

  showPosition(idxGame) {
    this.navCtrl.navigateRoot('/position/'+ this.idxCategory + '/' + this.idxSubcategory + '/' + idxGame);
  }

}
