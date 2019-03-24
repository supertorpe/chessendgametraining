import { Component, ViewChildren, QueryList } from '@angular/core';
import { Platform, NavController, IonRouterOutlet, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
import { EndgameDatabaseService, MiscService, EndgameDatabase, Category } from './shared';
import { Router } from '@angular/router';

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

  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  private lastTimeBackPress = 0;
  private timePeriodToExit = 2000;
  private literals: any;

  constructor(
    private platform: Platform,
    private router: Router,
    private toast: ToastController,
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

  private initializeApp() {
    this.platform.backButton.subscribe(async () => {
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        this.goBack();
      });
    });
    Promise.all([
      this.endgameDatabaseService.initialize(),
      this.platform.ready()
    ]).then((values: any[]) => {
      //this.translate.use(navigator.language);
      this.translate.use(this.translate.getBrowserLang());
      this.translate.get(['app.back-to-exit']).subscribe(async res => {
        this.literals = res;
      });
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

  private async goBack() {
    if (this.router.url === '/home') {
      if (this.lastTimeBackPress !== 0 && new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
        navigator['app'].exitApp();
      } else {
        const toast = await this.toast.create({
          message: this.literals['app.back-to-exit'],
          position: 'middle',
          color: 'medium',
          duration: this.timePeriodToExit
        });
        toast.present();
        this.lastTimeBackPress = new Date().getTime();
      }
    } else if (this.router.url.startsWith('/list/') ||
      this.router.url === '/preferences' || this.router.url === '/about') {
      this.navCtrl.navigateRoot('/home');
    } else if (this.router.url.startsWith('/position/')) {
      this.navCtrl.navigateRoot(this.router.url.substring(0, this.router.url.lastIndexOf('/')).replace('position', 'list'));
    }
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
    this.navCtrl.navigateRoot('/list/' + idxCategory + '/' + idxSubcategory);
  }

  private exit() {
    navigator['app'].exitApp();
  }

}
