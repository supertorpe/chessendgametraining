import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { EndgameDatabaseService, EndgameDatabase, Category, Subcategory, Position, MiscService, ConfigurationService, Configuration } from '../shared';
import { Observable, of } from 'rxjs';
import { AlertController, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ChessboardComponent } from '../chessboard';

@Component({
  selector: 'app-position',
  templateUrl: 'position.page.html',
  styleUrls: ['position.page.scss']
})
export class PositionPage implements OnInit, OnDestroy {

  private configuration: Configuration;
  public endgameDatabase: EndgameDatabase;
  public idxCategory: number;
  public idxSubcategory: number;
  public idxPosition: number;
  public idxLastSubcategory: number;
  public idxLastPosition: number;
  public showNavPrev = false;
  public showNavNext = false;
  public category$: Observable<Category>;
  public subcategory$: Observable<Subcategory>;
  public position$: Observable<Position>;
  public category: Category;
  public subcategory: Subcategory;
  public position: Position;
  public idx = 1;
  public targetImage = '';
  public infotext = '';
  public btnRewindEnabled = false;
  public btnUndoEnabled = false;
  public btnFlipEnabled = false;
  public btnSolveEnabled = false;
  public autosolve = false;
  public autosolveUsed = false;
  public engineThinking = false;
  public gameOver = false;
  public autoplaying = false;
  public intervalPlay;
  public literales: any;

  @ViewChild('chessboard') chessboard: ChessboardComponent;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private menuController: MenuController,
    public alertController: AlertController,
    public translate: TranslateService,
    private configurationService: ConfigurationService,
    private endgameDatabaseService: EndgameDatabaseService,
    private miscService: MiscService,
    private insomnia: Insomnia) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.idxCategory = +params.idxcategory;
      this.idxSubcategory = +params.idxsubcategory;
      this.idxPosition = +params.idxposition;
      this.endgameDatabaseService.initialize().then(result => {
        this.endgameDatabase = this.endgameDatabaseService.getDatabase();
        this.load();
      });
    });
  }

  ionViewWillEnter() {
    this.configurationService.initialize().then(config => {
      this.configuration = config;
      if (config.preventScreenOff) {
        this.insomnia.keepAwake();
      }
    });
    this.menuController.get('mainMenu').then(function (menu) {
      menu.swipeGesture = false;
    });
  }

  ionViewWillLeave() {
    if (this.configuration && this.configuration.preventScreenOff) {
      this.insomnia.allowSleepAgain();
    }
    this.stopAutoplay();
    this.menuController.get('mainMenu').then(function (menu) {
      menu.swipeGesture = true;
    });
  }

  ngOnDestroy() {
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const container = document.querySelector('.container');
    const boardWrapper: any = document.querySelector('.board_wrapper');
    const infoWrapper: any = document.querySelector('.info_wrapper');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const minSize = Math.min(containerWidth, containerHeight);
    boardWrapper.style.height = minSize + 'px';
    boardWrapper.style.width = minSize + 'px';
    if (containerWidth > containerHeight) {
      infoWrapper.style.width = containerWidth - minSize - 2 + 'px';
      infoWrapper.style.height = '100%';
    } else {
      infoWrapper.style.width = '100%';
      infoWrapper.style.height = containerHeight - minSize - 2 + 'px';
    }
  }

  load() {
    this.category = this.endgameDatabase.categories[this.idxCategory];
    this.subcategory = this.category.subcategories[this.idxSubcategory];
    this.position = this.subcategory.games[this.idxPosition];
    this.subcategory.images = this.miscService.textToImages(this.subcategory.name);
    this.category$ = of(this.category);
    this.subcategory$ = of(this.subcategory);
    this.position$ = of(this.position);
    this.idxLastSubcategory = this.endgameDatabase.categories[this.idxCategory].subcategories.length - 1;
    this.idxLastPosition = this.endgameDatabase.categories[this.idxCategory].subcategories[this.idxSubcategory].games.length - 1;
    this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0 || this.idxPosition > 0;
    this.showNavNext = !(this.idxCategory === this.endgameDatabase.categories.length - 1
      && this.idxSubcategory === this.idxLastSubcategory
      && this.idxPosition === this.idxLastPosition);
    if ('white' === this.position.move) {
      this.targetImage = 'wK.png';
    } else {
      this.targetImage = 'bK.png';
    }
    this.chessboard.build(this.position.fen, this.position.target);
    this.engineThinking = false;
    this.gameOver = false;
    this.btnRewindEnabled = false;
    this.btnUndoEnabled = false;
    this.btnFlipEnabled = true;
    this.btnSolveEnabled = true;
    this.translate.get([
      'position.your-turn',
      'position.used-assistance',
      'position.new-record',
      'position.goal-achieved',
      'position.congratulations',
      'position.review',
      'position.next-puzzle',
      'position.in',
      'position.moves',
      'position.ups',
      'position.keep-practicing',
      'position.ok'
    ]).subscribe(async res => {
      this.literales = res;
      this.infotext = this.literales['position.your-turn'];
    });
  }

  onEngineReady() {

  }

  onEngineStartThinking() {
    this.engineThinking = true;
  }

  onEngineEndThinking() {
    this.engineThinking = false;
    if (this.infotext !== this.literales['position.your-turn'])
      this.infotext += ' : ' + this.literales['position.your-turn'];
  }

  onEngineInfo(info) {
    this.infotext = info;
  }

  onPlayerMoved() {
    this.btnRewindEnabled = true;
    this.btnUndoEnabled = true;
  }

  async onGameOver(message) {
    this.engineThinking = false;
    this.infotext = message;
    this.gameOver = true;
    let header, subHeader, text;
    if (this.autosolve) {
      this.autosolve = false;
      return;
    }
    let buttons;
    if ((message === 'Checkmate' && this.chessboard.winner() === this.position.move) || (this.position.target !== 'checkmate' && message !== 'Checkmate')) {
      const totalMoves = this.chessboard.history().length;
      let playerMoves;
      if (totalMoves % 2 === 0) {
        playerMoves = totalMoves / 2;
      } else {
        playerMoves = (totalMoves + 1) / 2;
      }
      if (this.autosolveUsed) {
        header = this.literales['position.used-assistance'];
        buttons = [{
          test: this.literales['position.ok'],
          cssClass: 'overlay-button'
        }];
      } else {
        if (!this.position.record || this.position.record < 0 || playerMoves < this.position.record) {
          subHeader = this.literales['position.new-record']
          this.position.record = playerMoves;
          this.endgameDatabaseService.saveDatabase();
        } else {
          subHeader = this.literales['position.goal-achieved'];
        }
        header = this.literales['position.congratulations'];
        if (this.showNavNext) {
          buttons = [
            {
              text: this.literales['position.review'],
              cssClass: 'overlay-button'
            },
            {
              text: this.literales['position.next-puzzle'],
              cssClass: 'overlay-button',
              handler: () => { this.gotoNext(); }
            }
          ];
        } else {
          buttons = [{
            text: this.literales['position.ok'],
            cssClass: 'overlay-button'
          }];
        }
      }
      text = this.infotext + ' ' + this.literales['position.in'] + ' ' + playerMoves + ' ' + this.literales['position.moves'];
    } else {
      if (!this.position.record) {
        this.position.record = -1;
        this.endgameDatabaseService.saveDatabase();
      }
      header = this.literales['position.ups'];
      subHeader = message;
      text = this.literales['position.keep-practicing'];
      buttons = [{
        text: this.literales['position.ok'],
        cssClass: 'overlay-button'
      }];
    }
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: text,
      buttons: buttons
    });
    await alert.present();
  }

  btnRewindClick() {
    this.chessboard.rewind();
    this.autosolveUsed = false;
    this.btnRewindEnabled = false;
    this.btnUndoEnabled = false;
    this.gameOver = false;
    this.infotext = this.literales['position.your-turn'];
  }

  btnUndoClick() {
    this.chessboard.undo();
    const history = this.chessboard.history();
    this.btnRewindEnabled = history.length > 0;
    this.btnUndoEnabled = this.btnRewindEnabled;
    this.infotext = this.literales['position.your-turn'];
  }

  btnFlipClick() {
    this.chessboard.flip();
  }

  btnSolveClick() {
    this.autosolve = true;
    this.autosolveUsed = true;
    this.chessboard.solve();
  }

  btnHintlick() {
    this.autosolveUsed = true;
    this.chessboard.hint();
  }

  btnStopEngineClick() {
    this.chessboard.stop();
    if (this.autosolve) {
      this.autosolve = false;
    }
  }

  btnShowFirstPositionClick() {
    this.chessboard.showFirstPosition();
  }

  btnShowPreviousPositionClick() {
    this.chessboard.showPreviousPosition();
  }

  btnShowNextPositionClick() {
    this.chessboard.showNextPosition();
  }

  btnShowLatestPositionClick() {
    this.chessboard.showLatestPosition();
  }

  btnPlayClick() {
    const self = this;
    this.autoplaying = true;
    if (this.internalPlay()) {
      this.intervalPlay = setInterval(function () {
        if (!self.internalPlay()) {
          clearInterval(self.intervalPlay);
          self.intervalPlay = null;
        }
      }, 1000);
    }
  }

  internalPlay() {
    this.chessboard.showNextPosition();
    if (this.chessboard.isShowingLatestPosition()) {
      this.autoplaying = false;
      return false;
    }
    return true;
  }

  btnPauseClick() {
    this.autoplaying = false;
    clearInterval(this.intervalPlay);
  }

  private stopAutoplay() {
    if (this.intervalPlay) {
      clearInterval(this.intervalPlay);
      this.intervalPlay = null;
      this.autoplaying = false;
    }
  }

  gotoPrev() {
    this.stopAutoplay();
    let idxCat = this.idxCategory;
    let idxSub = this.idxSubcategory;
    let idxPos = this.idxPosition - 1;
    if (idxPos < 0) {
      idxSub--;
      if (idxSub < 0) {
        idxCat--;
        idxSub = this.endgameDatabase.categories[idxCat].subcategories.length - 1;
      }
      idxPos = this.endgameDatabase.categories[idxCat].subcategories[idxSub].games.length - 1;
    }
    //this.navCtrl.navigateRoot('/position/'+ idxCat + '/' + idxSub + '/' + idxPos);
    this.idxCategory = idxCat;
    this.idxSubcategory = idxSub;
    this.idxPosition = idxPos;
    this.location.go('/position/' + idxCat + '/' + idxSub + '/' + idxPos);
    this.load();
  }

  gotoNext() {
    this.stopAutoplay();
    let idxCat = this.idxCategory;
    let idxSub = this.idxSubcategory;
    let idxPos = this.idxPosition + 1;
    if (idxPos > this.idxLastPosition) {
      idxSub++;
      if (idxSub > this.idxLastSubcategory) {
        idxCat++;
        idxSub = 0;
      }
      idxPos = 0;
    }
    //this.navCtrl.navigateRoot('/position/'+ idxCat + '/' + idxSub + '/' + idxPos);
    this.idxCategory = idxCat;
    this.idxSubcategory = idxSub;
    this.idxPosition = idxPos;
    this.location.go('/position/' + idxCat + '/' + idxSub + '/' + idxPos);
    this.load();
  }

}
