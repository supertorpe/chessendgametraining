import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { EndgameDatabaseService, MiscService, EndgameDatabase, Category } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public endgameDatabase: EndgameDatabase = {
    version: null,
    categories: null
  };
  public prePages = [
    {
      title: 'home',
      url: '/home',
      icon: 'home'
    }
  ];

  postPages = [
    {
      title: 'preferences',
      url: '/preferences',
      icon: 'cog'
    },
    {
      title: 'about',
      url: '/about',
      icon: 'help'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private miscService: MiscService,
    private navCtrl: NavController,
    private endgameDatabaseService: EndgameDatabaseService
  ) {
    this.translate.setDefaultLang('en');
    this.initializeApp();
  }

  initializeApp() {
    Promise.all([
      this.endgameDatabaseService.initialize(),
      this.platform.ready()
    ]).then((values: any[]) => {
      //this.translate.use(navigator.language);
      this.translate.use(this.translate.getBrowserLang());
      this.endgameDatabase = this.endgameDatabaseService.getDatabase();
      this.endgameDatabase.categories.forEach(category => {
        category.selected = false;
        category.subcategories.forEach(subcategory => {
          subcategory.images = this.miscService.textToImages(subcategory.name);
        });
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      });
    });
  }

  toggleCategory(category: Category) {
    category.selected = !category.selected;
    this.endgameDatabase.categories.map(item => {
      if (item !== category && item.selected) {
        item.selected = false;
      }
    });
  }

  showList(idxCategory, idxSubcategory) {
    //this.router.navigate(['/list/'+ idxCategory+ '/' + idxSubcategory]);
    this.navCtrl.navigateRoot('/list/'+ idxCategory+ '/' + idxSubcategory);
  }

  exit() {
    navigator['app'].exitApp();
  }

}
