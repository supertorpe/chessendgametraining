import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { EndgameDatabaseService, EndgameDatabase, Category, Subcategory, Position, MiscService, ConfigurationService, Configuration } from '../shared';
import { Observable, of } from 'rxjs';
import { AlertController, MenuController, ToastController, ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ChessboardComponent } from '../chessboard';
import * as Chess from 'chess.js';
import { PreferencesPage } from '../preferences/preferences.page';

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
  public fen: string;
  public move: string;
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
  public gameOverMessage: string;
  public autoplaying = false;
  public intervalPlay;
  public literales: any;

  @ViewChild('chessboard', { static: true }) chessboard: ChessboardComponent;
  @ViewChild('fab', { static: true }) fab: any;

  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private location: Location,
    private menuController: MenuController,
    public alertController: AlertController,
    public translate: TranslateService,
    private configurationService: ConfigurationService,
    private endgameDatabaseService: EndgameDatabaseService,
    private miscService: MiscService,
    private insomnia: Insomnia,
    private clipboard: Clipboard,
    private toast: ToastController,
    public modalController: ModalController) {
  }

  ngOnInit() {
    this.configurationService.initialize().then(config => {
      this.configuration = config;
      this.route.params.subscribe(params => {
        this.idxCategory = +params.idxcategory;
        this.idxSubcategory = +params.idxsubcategory;
        this.idxPosition = +params.idxposition;
        if (params.idxposition) {
          this.endgameDatabaseService.initialize().then(result => {
            this.endgameDatabase = this.endgameDatabaseService.getDatabase();
            this.load();
          });
        } else if (params.fen1) {
          this.loadFen(`${params.fen1}/${params.fen2}/${params.fen3}/${params.fen4}/${params.fen5}/${params.fen6}/${params.fen7}/${params.fen8}`, params.target ? params.target : 'checkmate');
        }
      });
    });
  }

  ionViewWillEnter() {
    if (this.configuration && this.configuration.preventScreenOff) {
      this.insomnia.keepAwake();
    }
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

  initLocales() {
    this.translate.get([
      'position.your-turn',
      'position.used-assistance',
      'position.new-record',
      'position.goal-achieved',
      'position.congratulations',
      'position.review',
      'position.next-puzzle',
      'position.fen-clipboard',
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

  load() {
    this.category = this.endgameDatabase.categories[this.idxCategory];
    this.subcategory = this.category.subcategories[this.idxSubcategory];
    this.position = this.subcategory.games[this.idxPosition];
    this.subcategory.images = this.miscService.textToImages(this.subcategory.name);
    this.category$ = of(this.category);
    this.subcategory$ = of(this.subcategory);
    this.position$ = of(this.position);
    this.idxLastSubcategory = this.endgameDatabase.categories[this.idxCategory].count - 1;
    this.idxLastPosition = this.endgameDatabase.categories[this.idxCategory].subcategories[this.idxSubcategory].count - 1;
    this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0 || this.idxPosition > 0;
    this.showNavNext = !(this.idxCategory === this.endgameDatabase.count - 1
      && this.idxSubcategory === this.idxLastSubcategory
      && this.idxPosition === this.idxLastPosition);
    const chess: Chess = new Chess();
    chess.load(this.position.fen);
    if (chess.turn() == 'w') {
      this.move = 'white';
      this.targetImage = this.miscService.urlIcon('wK.png', this.configuration.pieceTheme);
    } else {
      this.move = 'black';
      this.targetImage = this.miscService.urlIcon('bK.png', this.configuration.pieceTheme);
    }
    this.chessboard.build(this.position.fen, this.position.target);
    this.engineThinking = false;
    this.gameOver = false;
    this.btnRewindEnabled = false;
    this.btnUndoEnabled = false;
    this.btnFlipEnabled = true;
    this.btnSolveEnabled = true;
    this.initLocales();
  }

  loadFen(fen: string, target: string) {
    this.fen = fen;
    const chess: Chess = new Chess();
    chess.load(fen);
    if (chess.turn() == 'w') {
      this.move = 'white';
      this.position = { "target": target, "fen": fen, record: -1 };
      this.targetImage = this.miscService.urlIcon('wK.png', this.configuration.pieceTheme);
    } else {
      this.move = 'black';
      this.position = { "target": target, "fen": fen, record: -1 };
      this.targetImage = this.miscService.urlIcon('bK.png', this.configuration.pieceTheme);
    }
    this.position$ = of(this.position);
    this.chessboard.build(fen, target);
    this.engineThinking = false;
    this.gameOver = false;
    this.btnRewindEnabled = false;
    this.btnUndoEnabled = false;
    this.btnFlipEnabled = true;
    this.btnSolveEnabled = true;
    this.initLocales();
  }

  trackFunc(index: number, obj: any) {
    return index;
  }
  
  onEngineReady() {

  }

  onEngineStartThinking() {
    if (this.gameOver) {
      return;
    }
    if (this.fab.activated) this.fab.close();
    this.engineThinking = true;
  }

  onEngineEndThinking() {
    this.engineThinking = false;
    if (this.infotext !== this.literales['position.your-turn'])
      this.infotext += ' : ' + this.literales['position.your-turn'];
  }

  async onEngineInfo(info) {
    this.infotext = info;
  }

  async onWarn(info) {
    const toast = await this.toast.create({
      message: info,
      position: 'middle',
      color: 'warning',
      duration: 3000
    });
    toast.present();
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
      this.gameOverMessage = 'used-assistance';
      this.autosolve = false;
      return;
    }
    let buttons;
    if ((message === 'Checkmate' && this.chessboard.winner() === this.move) || (this.position.target !== 'checkmate' && message !== 'Checkmate')) {
      const totalMoves = this.chessboard.history().length;
      let playerMoves;
      if (totalMoves % 2 === 0) {
        playerMoves = totalMoves / 2;
      } else {
        playerMoves = (totalMoves + 1) / 2;
      }
      if (this.autosolveUsed) {
        this.gameOverMessage = 'used-assistance';
        header = this.literales['position.used-assistance'];
        buttons = [{
          test: this.literales['position.ok'],
          cssClass: 'overlay-button'
        }];
      } else {
        this.gameOverMessage = 'goal-achieved';
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
      this.gameOverMessage = 'keep-practicing';
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

  private async settingsDialog(): Promise<Configuration> {
    return new Promise<Configuration>(async resolve => {
      const modal = await this.modalController.create({
        component: PreferencesPage,
        componentProps: { isModal: true }
      });
      modal.present();
      const { data } = await modal.onDidDismiss();
      if (data == undefined) {
        resolve(null);
      } else {
        resolve(data.config);
      }
    });
  }

  btnSettingsClick() {
    const self = this;
    this.settingsDialog().then(function(config) {
      self.configurationService.notifyChanges(config);
    });
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
    if (this.fab.activated) this.fab.close();
    this.autosolve = true;
    this.autosolveUsed = true;
    this.chessboard.solve();
  }

  btnCopyClipboardClick() {
    const self = this;
    if (this.platform.is('cordova')) {
      this.clipboard.copy(this.chessboard.fen()).then(() => self.showToastClipboard());
    } else {
      const el = document.createElement('textarea');
      el.value = this.chessboard.fen();
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.showToastClipboard();
    }
  }

  private async showToastClipboard() {
    const toast = await this.toast.create({
      message: this.literales['position.fen-clipboard'],
      position: 'middle',
      color: 'success',
      duration: 1000
    });
    toast.present();
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
    if (this.fab.activated) this.fab.close();
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
        idxSub = this.endgameDatabase.categories[idxCat].count - 1;
      }
      idxPos = this.endgameDatabase.categories[idxCat].subcategories[idxSub].count - 1;
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
