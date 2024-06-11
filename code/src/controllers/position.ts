import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, redrawIconImages, releaseWakeLock, requestWakeLock, routeService, soundService, stockfishService, syzygyService } from '../services';
import { MAIN_MENU_ID, ariaDescriptionFromIcon, isBot, pieceCount, pieceTotalCount, queryParam, randomNumber, setupSEO } from '../commons';
import { Category, MoveItem, Position, Subcategory } from '../model';
import { Chess, ChessInstance, PieceType, SQUARES, Square } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { MoveMetadata, Color, Key } from 'chessground/types';
import { Config } from 'chessground/config';
import { promotionController } from './promotion';
import { alertController, menuController, toastController } from '@ionic/core';
import { settingsController } from './settings';
import domtoimage from 'dom-to-image-hm';
import { checkmateCatalog } from '../static';

class PositionController extends BaseController {

  private seo!: string;
  private chess: ChessInstance = Chess();
  private board!: Api;
  private boardConfig!: Config;
  private position!: Position | undefined;
  private fen = Alpine.reactive({ value: '' });
  private idxCategory: { value: number } = Alpine.reactive({ value: -1 });
  private idxSubcategory: { value: number } = Alpine.reactive({ value: -1 });
  private idxGame: { value: number } = Alpine.reactive({ value: -1 });
  private idxLastSubcategory: { value: number } = Alpine.reactive({ value: -1 });
  private idxLastGame: { value: number } = Alpine.reactive({ value: -1 });
  private moveList: MoveItem[][] = Alpine.reactive([[]]);
  private variantPointer: { value: number } = Alpine.reactive({ value: 0 });
  private movePointer: { value: number } = Alpine.reactive({ value: -1 });
  private player!: "w" | "b";
  private target = Alpine.reactive({ value: '' });
  private checkmateMoves = Alpine.reactive({ value: 0 });
  private move = Alpine.reactive({ value: '' });
  private useSyzygy = false;
  private gameOver = Alpine.reactive({ value: false });
  private showNavPrev = Alpine.reactive({ value: false });
  private showNavNext = Alpine.reactive({ value: false });
  private waitingForOpponent = Alpine.reactive({ value: false });
  private askingForHint = Alpine.reactive({ value: false });
  private solving = Alpine.reactive({ value: false });
  private solvingTrivial = false;
  private assistanceUsed = false;
  private trivialPositionInvitationShown = false;
  private mateDistance = 0;
  private unfeasibleMate = false;
  private manualMode = Alpine.reactive({ value: false });
  private mustShowExitDialog = true;
  private stopping = Alpine.reactive({ value: false });
  private stockfishWarmup = false;
  private stockfishWarningShowed = false;
  private stockfishWarnTimeout: number | null = null;

  constructor() {
    super();
    stockfishService.messageEmitter.addEventListener((message: string) => this.stockfishMessage(message));
  }

  private resizeBoard() {
    const headers = Array.from(document.querySelectorAll('ion-header')) as HTMLElement[];
    const header = headers.find(header => header.clientHeight > 0);
    if (!header) return;
    const container = document.querySelector('.container') as HTMLElement;
    const infoWrapper = document.querySelector('.info_wrapper') as HTMLElement;
    const infoMoves = document.querySelector('.info_moves') as HTMLElement;
    const actionButtons = document.querySelector('.action_buttons') as HTMLElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    let minSize = Math.min(containerWidth, containerHeight);
    const mod = minSize % 8;
    minSize = minSize - mod;
    const board: any = document.getElementById('__chessboard__');
    board.style.height = `${minSize}px`;
    board.style.width = `${minSize}px`;

    if (containerWidth > containerHeight) {
      infoWrapper.style.width = `${(containerWidth - minSize - 2)}px`;
      infoWrapper.style.height = `calc(100% - ${actionButtons.clientHeight}px`;
    } else {
      infoWrapper.style.width = '100%';
      infoWrapper.style.height = `calc(100% - ${minSize + actionButtons.clientHeight + 2}px`;
    }
    infoMoves.style.height = `${infoWrapper.clientHeight}px`;
    actionButtons.style.width = `${infoWrapper.clientWidth}px`;
  }

  private toDests(): Map<Key, Key[]> {
    const dests = new Map();
    SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
  }

  private async initStockfishGame() {
    if (this.stockfishWarmup) {
      await stockfishService.stopWarmup().then(() => this.stockfishWarmup = false);
    }
    this.stockfishWarmup = true;
    stockfishService.postMessage('ucinewgame');
    stockfishService.postMessage('isready');
    stockfishService.warmup(this.fen.value);
  }

  private resetPosition(newGame: boolean) {
    this.waitingForOpponent.value = false;
    redrawIconImages();
    this.stopStockfish();
    if (newGame) {
      this.initStockfishGame();
    }
    this.chess.load(this.fen.value);
    this.gameOver.value = false;
    this.unfeasibleMate = false;
    let forcePlayer: "w" | "b" | null = null;
    const ply = queryParam('player');
    if (ply && (ply == 'w' || ply == 'b')) forcePlayer = ply;
    this.player = forcePlayer != null ? forcePlayer : this.chess.turn();
    const turn = this.chess.turn() == 'w' ? 'white' : 'black';
    this.move.value = turn;
    this.board.set({
      fen: this.chess.fen(),
      turnColor: turn,
      lastMove: [],
      viewOnly: false,
      movable: {
        color: turn,
        dests: this.toDests()
      }
    });
    if (!this.board.state.orientation.startsWith(this.player))
      this.board.toggleOrientation();
    this.moveList.splice(0, this.moveList.length);
    this.moveList.push([]);
    this.variantPointer.value = 0;
    this.movePointer.value = -1;
    this.assistanceUsed = false;
    this.solvingTrivial = false;
    this.solving.value = false;
    this.stopping.value = false;
    this.trivialPositionInvitationShown = this.isTrivialPosition();
    this.manualMode.value = false;
    this.mustShowExitDialog = true;
    if (this.player != this.chess.turn()) this.getOpponentMove();
  }

  private stopStockfish() {
    stockfishService.postMessage('stop');
    if (this.stockfishWarnTimeout) {
      clearTimeout(this.stockfishWarnTimeout);
      this.stockfishWarnTimeout = null;
    }
  }

  private showRestartDialog() {
    alertController.create({
      header: window.AlpineI18n.t('position.confirm-restart.header'),
      message: window.AlpineI18n.t('position.confirm-restart.message'),
      buttons: [
        {
          text: window.AlpineI18n.t('position.confirm-restart.no'),
          role: 'cancel',
          cssClass: 'overlay-button',
          handler: () => {
          }
        }, {
          text: window.AlpineI18n.t('position.confirm-restart.yes'),
          cssClass: 'overlay-button',
          handler: () => {
            this.resetPosition(false);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  private movePosition(direction: number) {
    this.showExitDialog().then(value => {
      if (value) {
        const endgameDatabase = endgameDatabaseService.endgameDatabase;
        const categories = endgameDatabase.categories;
        this.idxGame.value += direction;
        if (this.idxGame.value < 0 || this.idxGame.value > this.idxLastGame.value) {
          this.idxSubcategory.value += direction;
          if (this.idxSubcategory.value < 0 || this.idxSubcategory.value > this.idxLastSubcategory.value) {
            this.idxCategory.value += direction;
            this.idxSubcategory.value = direction > 0 ? 0 : categories[this.idxCategory.value].count - 1;
            this.idxLastSubcategory.value = categories[this.idxCategory.value].count - 1;
          }
          this.idxGame.value = direction > 0 ? 0 : categories[this.idxCategory.value].subcategories[this.idxSubcategory.value].count - 1;
          this.idxLastGame.value = categories[this.idxCategory.value].subcategories[this.idxSubcategory.value].count - 1;
        }
        this.showNavPrev.value = this.idxSubcategory.value > 0 || this.idxCategory.value > 0 || this.idxGame.value > 0;
        this.showNavNext.value = !(this.idxCategory.value === endgameDatabase.count - 1 && this.idxSubcategory.value === this.idxLastSubcategory.value && this.idxGame.value === this.idxLastGame.value);
        this.position = categories[this.idxCategory.value].subcategories[this.idxSubcategory.value].games[this.idxGame.value];
        this.target.value = this.position.target;
        this.fen.value = this.position.fen;
        this.seo = `${window.AlpineI18n.t(`category.${categories[this.idxCategory.value].name}`)} (${categories[this.idxCategory.value].subcategories[this.idxSubcategory.value].name}) ${this.idxGame.value + 1}/${this.idxLastGame.value + 1}`;
        setupSEO('page-list.html', this.getSEOParams());
        window.history.replaceState(this.seo, this.seo, `/position/${this.idxCategory.value}/${this.idxSubcategory.value}/${this.idxGame.value}`);
        this.resetPosition(true);
      }
    });
  }

  private showPreviousPosition() {
    const canMovePrevious = this.idxSubcategory.value > 0 || this.idxCategory.value > 0 || this.idxGame.value > 0;
    if (canMovePrevious) {
      this.movePosition(-1);
    }
  }

  private showNextPosition() {
    if (this.checkmateMoves.value > 0) {
      this.fen.value = checkmateCatalog[this.checkmateMoves.value - 1][randomNumber(0, 999)];
      this.seo = this.fen.value;
      this.showExitDialog().then(value => {
        if (value) {
          this.resetPosition(true);
        }
      });
    } else {
      const canMoveNext = !(this.idxCategory.value === endgameDatabaseService.endgameDatabase.count - 1 && this.idxSubcategory.value === this.idxLastSubcategory.value && this.idxGame.value === this.idxLastGame.value);
      if (canMoveNext) {
        this.movePosition(1);
      }
    }
  }

  private showPruneDialog(idx: number) {
    if (this.solving.value || this.waitingForOpponent.value) return;
    const prefix = (idx == this.moveList[this.variantPointer.value].length - 1 ? 'position.confirm-prune-one' : 'position.confirm-prune');
    alertController.create({
      header: window.AlpineI18n.t(`${prefix}.header`),
      message: window.AlpineI18n.t(`${prefix}.message`),
      buttons: [
        {
          text: window.AlpineI18n.t(`${prefix}.no`),
          role: 'cancel',
          cssClass: 'overlay-button',
          handler: () => {
          }
        }, {
          text: window.AlpineI18n.t(`${prefix}.yes`),
          cssClass: 'overlay-button',
          handler: () => {
            this.pruneMove(idx);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  private pruneMove(idx: number) {
    do {
      this.moveList[this.variantPointer.value].splice(idx, 1);
    } while (this.moveList[this.variantPointer.value].length > idx);
    if (idx == 0) {
      if (this.moveList.length > 1) {
        this.moveList.splice(this.variantPointer.value, 1);
        this.variantPointer.value -= (this.variantPointer.value == 0 ? 0 : 1);
      }
      this.gotoMove(-1);
    } else {
      this.gotoMove(idx - 1);
    }
  }

  private gotoMove(idx: number) {
    if (this.movePointer.value == idx || this.solving.value || this.waitingForOpponent.value) return;
    this.movePointer.value = idx;
    redrawIconImages();
    this.stopStockfish();
    let prevFen;
    if (idx > -1) {
      this.chess.load(this.fen.value);
      const moves = this.getMoves()?.split(' ');
      moves?.forEach((move) => {
        if (move.trim()) {
          prevFen = this.chess.fen();
          this.chess.move(move.trim());
        }
      });
      const history = this.chess.history({ verbose: true });
      const lastMove = history[history.length - 1];
      const prevLastMove = history.length > 1 ? history[history.length - 2] : undefined;

      this.gameOver.value = this.chess.game_over();
      const turn = this.chess.turn() == 'w' ? 'white' : 'black';
      if (prevFen) {
        this.board.set({
          fen: prevFen,
          turnColor: turn,
          lastMove: prevLastMove ? [prevLastMove.from, prevLastMove.to] : [],
          viewOnly: this.gameOver.value,
          movable: {
            color: turn,
            dests: this.toDests()
          }
        });
        setTimeout(() => {
          this.board.set({
            fen: this.chess.fen(),
            turnColor: turn,
            lastMove: lastMove ? [lastMove.from, lastMove.to] : [],
            viewOnly: this.gameOver.value,
            movable: {
              color: turn,
              dests: this.toDests()
            }
          });
        }, 500);
      } else {
        this.board.set({
          fen: this.chess.fen(),
          turnColor: turn,
          lastMove: lastMove ? [lastMove.from, lastMove.to] : [],
          viewOnly: this.gameOver.value,
          movable: {
            color: turn,
            dests: this.toDests()
          }
        });
      }
    } else {
      this.chess.load(this.fen.value);
      this.gameOver.value = this.chess.game_over();
      const turn = this.chess.turn() == 'w' ? 'white' : 'black';
      this.board.set({
        fen: this.chess.fen(),
        turnColor: turn,
        lastMove: [],
        viewOnly: false,
        movable: {
          color: turn,
          dests: this.toDests()
        }
      });
      if (this.player != this.chess.turn()) this.getOpponentMove();
    }
    this.trivialPositionInvitationShown = this.isTrivialPosition();
  }

  private gotoVariant(idx: number) {
    if (this.variantPointer.value == idx || this.solving.value || this.waitingForOpponent.value) return;
    this.variantPointer.value = idx;
    this.movePointer.value = -2;
    this.gotoMove(this.moveList[idx].length - 1);
  }

  private stop() {
    this.stopping.value = true;
    this.stopStockfish();
  }

  onEnter($routeParams?: any): void {
    const self = this;
    // prevent menu swipe gesture
    menuController.get(MAIN_MENU_ID).then(function (menu) {
      if (menu) menu.swipeGesture = false;
    });
    // prevent screen off
    requestWakeLock();

    this.useSyzygy = configurationService.configuration.useSyzygy;
    let category: Category;
    let subcategory: Subcategory;
    stockfishService.debug = (queryParam('debug') == 'true');
    const customFen = ($routeParams['fen1'] !== undefined);
    const checkmatePattern = ($routeParams['moves'] !== undefined);
    if (checkmatePattern) {
      this.position = undefined;
      this.checkmateMoves.value = $routeParams['moves'];
      this.fen.value = checkmateCatalog[this.checkmateMoves.value - 1][randomNumber(0, 999)];
      this.target.value = 'checkmate';
      this.seo = this.fen.value;
    } else if (customFen) {
      this.fen.value = `${$routeParams['fen1']}/${$routeParams['fen2']}/${$routeParams['fen3']}/${$routeParams['fen4']}/${$routeParams['fen5']}/${$routeParams['fen6']}/${$routeParams['fen7']}/${$routeParams['fen8']}`;
      this.target.value = $routeParams['target'] || 'checkmate';
      this.seo = this.fen.value;
    } else {
      this.checkmateMoves.value = 0;
      this.idxCategory.value = parseInt($routeParams['idxCategory']);
      this.idxSubcategory.value = parseInt($routeParams['idxSubcategory']);
      const category = endgameDatabaseService.endgameDatabase.categories[this.idxCategory.value];
      const subcategory = category.subcategories[this.idxSubcategory.value];
      this.idxGame.value = parseInt($routeParams['idxGame']);
      this.position = subcategory.games[this.idxGame.value];
      this.idxLastSubcategory.value = category.count - 1;
      this.idxLastGame.value = subcategory.count - 1;
      this.fen.value = this.position.fen;
      this.target.value = this.position.target;
      this.seo = `${window.AlpineI18n.t(`category.${category.name}`)} (${subcategory.name}) ${this.idxGame.value + 1}/${this.idxLastGame.value + 1}`;
      this.showNavPrev.value = this.idxSubcategory.value > 0 || this.idxCategory.value > 0 || this.idxGame.value > 0;
      this.showNavNext.value = !(this.idxCategory.value === endgameDatabaseService.endgameDatabase.count - 1 && this.idxSubcategory.value === this.idxLastSubcategory.value && this.idxGame.value === this.idxLastGame.value);
    }
    if (!isBot()) {
      this.initStockfishGame();
    }
    this.chess.load(this.fen.value);
    this.moveList.splice(0, this.moveList.length);
    this.moveList.push([]);
    this.variantPointer.value = 0;
    this.movePointer.value = -1;
    this.gameOver.value = false;
    let forcePlayer: "w" | "b" | null = null;
    const ply = queryParam('player');
    if (ply && (ply == 'w' || ply == 'b')) forcePlayer = ply;
    this.player = forcePlayer != null ? forcePlayer : this.chess.turn();
    this.stopping.value = false;
    this.trivialPositionInvitationShown = this.isTrivialPosition();
    this.assistanceUsed = false;
    this.solvingTrivial = false;
    this.solving.value = false;
    this.manualMode.value = false;

    const turnWhite = this.chess.turn() == 'w';
    const turnColor: Color = (turnWhite ? 'white' : 'black');
    this.move.value = (turnWhite ? 'white' : 'black');
    this.boardConfig = {
      fen: this.chess.fen(),
      viewOnly: false,
      orientation: this.player == 'w' ? 'white' : 'black',
      turnColor: turnColor,
      premovable: {
        enabled: false
      },
      movable: {
        free: false,
        color: turnColor,
        dests: this.toDests(),
        showDests: configurationService.configuration.highlightSquares,
        events: {
          after: (orig: Key, dest: Key, _metadata: MoveMetadata) => { this.afterMove(orig, dest); }
        }
      },
      highlight: {
        lastMove: true,
        check: true
      },
      draggable: {
        enabled: true,
        autoDistance: true,
        showGhost: true
      },
      selectable: {
        enabled: true
      }
    };
    window.addEventListener('resize', function () {
      self.resizeBoard();
    });

    Alpine.data('info', () => ({
      position: self,
      colorTheme: configurationService.configuration.colorTheme,
      boardTheme: configurationService.configuration.boardTheme,
      pieceTheme: configurationService.configuration.pieceTheme,
      customFen: customFen,
      checkmatePattern: checkmatePattern,
      checkmateMoves: this.checkmateMoves,
      fen: this.fen,
      target: self.target,
      player: self.player,
      move: self.move,
      idxCategory: self.idxCategory,
      idxSubcategory: self.idxSubcategory,
      idxGame: self.idxGame,
      category: category,
      subcategory: subcategory,
      game: this.position,
      moveList: self.moveList,
      variantPointer: self.variantPointer,
      movePointer: self.movePointer,
      manualMode: self.manualMode,
      idxLastSubcategory: self.idxLastSubcategory,
      idxLastGame: self.idxLastGame,
      showNavPrev: self.showNavPrev,
      showNavNext: self.showNavNext,
      ariaDescriptionFromIcon: ariaDescriptionFromIcon,
      chess: this.chess,
      toggleManualMode() {
        this.manualMode.value = !this.manualMode.value;
        toastController.create({
          message: window.AlpineI18n.t(`position.mode-${this.manualMode.value ? 'manual' : 'engine'}`),
          position: 'middle',
          color: 'success',
          duration: 2000
        }).then(toast => toast.present());
        if (this.chess.turn() != self.player) self.getOpponentMove();
      },
      showPreviousPosition() {
        self.showPreviousPosition.call(self);
      },
      showNextPosition() {
        self.showNextPosition.call(self);
      },
      showRestartDialog() {
        self.showRestartDialog.call(self);
      },
      gotoMove(idx: number) {
        self.gotoMove.call(self, idx);
      },
      gotoVariant(idx: number) {
        self.gotoVariant.call(self, idx);
      },
      showPruneDialog(idx: number) {
        self.showPruneDialog.call(self, idx);
      },
      stop() {
        self.stop.call(self);
      },
      hint() {
        self.getHint.call(self);
      },
      solve() {
        self.solve.call(self);
      },
      showSettings() {
        routeService.openModal('settings', 'page-settings.html', settingsController, true, false);
      },
      showClipboardDialog() {
        alertController.create({
          header: window.AlpineI18n.t('position.clipboard.header'),
          message: window.AlpineI18n.t('position.clipboard.message'),
          inputs: [
            {
              type: 'radio',
              label: 'FEN',
              value: 'FEN',
              checked: true
            },
            {
              type: 'radio',
              label: 'PGN',
              value: 'PGN',
              checked: false
            },
            {
              type: 'radio',
              label: 'IMG',
              value: 'IMG',
              checked: false
            }
          ],
          buttons: [
            {
              text: window.AlpineI18n.t('position.clipboard.cancel'),
              role: 'cancel',
              cssClass: 'overlay-button'
            },
            {
              text: window.AlpineI18n.t('position.clipboard.ok'),
              cssClass: 'overlay-button',
              handler: async (data: string) => {
                if (data == 'FEN') {
                  self.copyToClipboard('fen', self.chess.fen());
                } else if (data == 'PGN') {
                  self.copyToClipboard('pgn', self.chess.pgn());
                } else if (data == 'IMG') {
                  const toast1 = await toastController.create({
                    message: window.AlpineI18n.t('position.clipboard.img-capture'),
                    position: 'middle',
                    color: 'success'
                  });
                  toast1.present();
                  const chessboard = document.getElementById('__chessboard__') as HTMLDivElement;
                  domtoimage.toPng(chessboard).then((dataUrl: string) => {
                    toast1.dismiss();
                    self.cropImage(dataUrl, chessboard.clientWidth, chessboard.clientHeight)
                      .then(croppedDataUrl => self.saveBase64AsFile(croppedDataUrl, 'chessboard.png'));
                  });
                }
              }
            }
          ]
        }).then(alert => alert.present());
      },
      lichessAnalysis() {
        window.open(`https://lichess.org/analysis/${this.chess.fen()}`, '_blank');
      },
      init() {
        self.board = Chessground(document.getElementById('__chessboard__') as HTMLElement, self.boardConfig);
        // resize the board on the next tick, when the DOM of the chessboard has been loaded
        requestAnimationFrame(() => {
          self.resizeBoard();
        });
        this.$nextTick().then(() => { routeService.updatePageLinks(); });
        if (self.player != this.chess.turn()) self.getOpponentMove.call(self);
        ['manualMode'].forEach((item) => {
          this.$watch(item, (_value) => {
            redrawIconImages();
          });
        });
        this.$watch('movePointer', (_value) => {
          requestAnimationFrame(() => {
            const movelist = document.querySelector('.info_moves') as HTMLIonListElement;
            const item = document.getElementById(`item-${this.movePointer.value}`) as HTMLElement;
            if (item) {
              const y = item.offsetHeight * (this.movePointer.value);
              movelist.scrollTo({ top: y, behavior: 'smooth' });
            }
          });
        });
        configurationService.configuration.configurationChangedEmitter.addEventListener((event) => {
          switch (event.field) {
            case 'colorTheme': this.colorTheme = event.config.colorTheme; break;
            case 'boardTheme': this.boardTheme = event.config.boardTheme; break;
            case 'pieceTheme': this.pieceTheme = event.config.pieceTheme; break;
            case 'highlightSquares': {
              if (self.boardConfig.movable) {
                self.board.set({
                  movable: { showDests: event.config.highlightSquares },
                });
              }
              break;
            }
            case 'useSyzygy': self.useSyzygy = configurationService.configuration.useSyzygy; break;
          }
        });
      }
    }));
  }

  afterMove(orig: Key, dest: Key) {
    if (orig == 'a0' || dest == 'a0') return;
    // check promotion
    if (this.chess.get(orig)?.type == 'p' && (dest.charAt(1) == '8' || dest.charAt(1) == '1')) {
      routeService.openModal('promotion', 'page-promotion.html', promotionController, false, true, this.player).then((data: any) => {
        this.registerMove(orig, dest, data.piece);
      });
    } else {
      this.registerMove(orig, dest, undefined);
    }
  }

  private updateMoveList(prevFen: string) {
    const history = this.chess.history({ verbose: true });
    const historyItem = history[history.length - 1];
    const historyPrevItem = (history.length > 1 ? history[history.length - 2] : undefined);
    const isMove2 = (this.chess.turn() == 'w');
    let order;
    if (this.movePointer.value < 0) {
      order = 1;
    } else {
      order = this.moveList[this.variantPointer.value][this.movePointer.value].order + (isMove2 ? 0 : 1);
    }
    const moveString = `${historyItem.from}${historyItem.to}${historyItem.promotion || ''}`;
    const prevMoveString = (historyPrevItem != undefined ? `${historyPrevItem.from}${historyPrevItem.to}${historyPrevItem.promotion || ''}` : '...');
    // check if the move already exists in some variant
    let i = 0;
    let idx = -1;
    for (i = 0; i < this.moveList.length; i++) {
      idx = this.moveList[i].findIndex(move => move.prevFen == prevFen && move.order == order && (isMove2 ? move.move1 == prevMoveString && move.move2 == moveString : move.move1 == moveString));
      if (idx > -1) break;
    }
    if (idx > -1) {
      this.variantPointer.value = i;
      this.movePointer.value = idx;
    } else if (isMove2) {
      if (this.movePointer.value == -1 || (this.moveList[this.variantPointer.value][this.movePointer.value].move2 && this.moveList[this.variantPointer.value][this.movePointer.value].move2 != moveString)) {
        const move: MoveItem = {
          order: order,
          prevFen: prevFen,
          move1: this.movePointer.value == -1 ? '...' : this.moveList[this.variantPointer.value][this.movePointer.value].move1,
          san1: this.movePointer.value == -1 ? '...' : this.moveList[this.variantPointer.value][this.movePointer.value].san1,
          move2: moveString, san2: history[history.length - 1].san
        };
        // create a new variant
        if (this.moveList[this.variantPointer.value].length > 0) {
          const moves: MoveItem[] = [];
          for (let i = 0; i <= this.movePointer.value - 1; i++) {
            moves.push(this.moveList[this.variantPointer.value][i]);
          }
          this.moveList.push(moves);
          this.variantPointer.value = this.moveList.length - 1;
        }
        this.moveList[this.variantPointer.value].push(move);
        this.movePointer.value = this.moveList[this.variantPointer.value].length - 1;
      } else {
        const move = this.moveList[this.variantPointer.value][this.movePointer.value];
        move.move2 = moveString;
        move.san2 = historyItem.san;
      }
    } else {
      const move: MoveItem = {
        order: order,
        prevFen: prevFen,
        move1: moveString, san1: history[history.length - 1].san,
        move2: '', san2: ''
      };
      // latest move => create a new one
      if (this.moveList[this.variantPointer.value].length == 0 || (!isMove2 && this.movePointer.value == this.moveList[this.variantPointer.value].length - 1)) {
        this.moveList[this.variantPointer.value].push(move);
        this.movePointer.value = this.moveList[this.variantPointer.value].length - 1;
      } else { // create a new variant
        const moves: MoveItem[] = [];
        for (let i = 0; i <= this.movePointer.value; i++) {
          moves.push(this.moveList[this.variantPointer.value][i]);
        }
        moves.push(move);
        this.moveList.push(moves);
        this.variantPointer.value = this.moveList.length - 1;
        this.movePointer.value = moves.length - 1;
      }
    }
  }

  private getMoves() {
    let pointer = this.movePointer.value;
    if (pointer == -1) return null;
    let result = '';
    for (let i = 0; i <= pointer; i++) {
      let move = this.moveList[this.variantPointer.value][i];
      if (move.san1 != '...' && move.san1 != '') result = `${result} ${move.san1}`;
      if (move.san2 != '' && (i != pointer || this.player != 'b')) result = `${result} ${move.san2}`;
    }
    return result;
  }

  // The opponent has only its king and the player has, at least, one queen or one rook
  private isTrivialPosition() {
    const pieceCounts = pieceCount(this.chess.fen());
    let playerHasRookOrQueen = false;
    for (const piece in pieceCounts) {
      const isPlayerPiece = (piece == piece.toUpperCase() && this.player == 'w') || (piece == piece.toLowerCase() && this.player == 'b');
      if (!isPlayerPiece && piece.toUpperCase() != 'K' && pieceCounts[piece] > 0) return false;
      if (isPlayerPiece && (piece.toUpperCase() == 'Q' || piece.toUpperCase() == 'R') && pieceCounts[piece] > 0) playerHasRookOrQueen = true;
    }
    return playerHasRookOrQueen;
  }

  // One of the players has only its king
  /*
    private onePlayerWithOnlyKing() {
      const pieceCounts = pieceCount(this.chess.fen());
      let whiteHasOtherPieces = false;
      let blackHasOtherPieces = false;
      for (const piece in pieceCounts) {
        whiteHasOtherPieces = whiteHasOtherPieces || (piece == piece.toUpperCase() && piece.toUpperCase() != 'K' && pieceCounts[piece] > 0);
        blackHasOtherPieces = blackHasOtherPieces || (piece == piece.toLowerCase() && piece.toLowerCase() != 'k' && pieceCounts[piece] > 0);
      }
      return !(whiteHasOtherPieces && blackHasOtherPieces);
    }
  */
  private async registerMove(source: Square, target: Square, promotion: Exclude<PieceType, "p" | "k"> | undefined) {
    if (this.stockfishWarmup) {
      await stockfishService.stopWarmup().then(() => this.stockfishWarmup = false);
    }
    const nextMove = () => {
      if (!this.manualMode.value) {
        this.getOpponentMove();
      } else {
        const turn = this.chess.turn() == 'w' ? 'white' : 'black';
        this.board.set({
          fen: this.chess.fen(),
          turnColor: turn,
          viewOnly: false,
          movable: {
            color: turn,
            dests: this.toDests()
          }
        });
      }
    };
    const prevFen = this.chess.fen();
    this.chess.move({
      from: source,
      to: target,
      promotion: promotion
    });
    if (promotion)
      this.board.set({ fen: this.chess.fen() });

    this.updateMoveList(prevFen);

    if (!this.checkEnding()) {
      soundService.playAudio('move');
      if (!this.trivialPositionInvitationShown && this.isTrivialPosition()) {
        this.trivialPositionInvitationShown = true;
        alertController.create({
          header: window.AlpineI18n.t('position.confirm-trivial-position.header'),
          message: window.AlpineI18n.t('position.confirm-trivial-position.message'),
          buttons: [
            {
              text: window.AlpineI18n.t('position.confirm-trivial-position.no'),
              role: 'cancel',
              cssClass: 'overlay-button',
              handler: () => {
                nextMove();
              }
            }, {
              text: window.AlpineI18n.t('position.confirm-trivial-position.yes'),
              cssClass: 'overlay-button',
              handler: () => {
                this.solvingTrivial = true;
                this.solve();
              }
            }
          ]
        }).then(alert => alert.present());
      } else {
        nextMove();
      }
    }
  }

  private checkEnding(): boolean {
    const result = this.chess.game_over();
    if (result) {
      this.gameOver.value = true;
      this.solving.value = false;
      this.solvingTrivial = false;

      let goalAchieved = ('checkmate' !== this.target.value && !this.chess.in_checkmate() ||
        'checkmate' == this.target.value && this.chess.in_checkmate() && this.player != this.chess.turn());
      const moveCount = this.chess.history().length;
      if (goalAchieved && this.checkmateMoves.value > 0 && this.checkmateMoves.value < Math.ceil(moveCount / 2)) {
        goalAchieved = false;
      }
      const record = goalAchieved && this.position && (!this.position.record || this.position.record < 0 || moveCount < this.position.record);

      if (goalAchieved) {
        soundService.playAudio('success');
      } else {
        soundService.playAudio('fail');
      }

      // update database status
      if (this.position && !this.assistanceUsed) {
        if (!goalAchieved && !this.position.record) {
          this.position.record = -1;
          endgameDatabaseService.save();
        } else if (record) {
          this.position.record = moveCount;
          endgameDatabaseService.save();
        }
      }

      let header;
      if (this.chess.in_checkmate())
        header = 'position.checkmate';
      else if (this.chess.in_stalemate())
        header = 'position.stalemate';
      else if (this.chess.insufficient_material())
        header = 'position.insufficent-material';
      else if (this.chess.in_threefold_repetition())
        header = 'position.three-repetition';
      else if (this.chess.in_draw())
        header = 'position.rule-fifty';
      else
        header = 'position.game-over';

      let message;
      let inviteNextPuzzle = false;
      const categoryCount = endgameDatabaseService.endgameDatabase.count;
      if (!this.move.value.startsWith(this.player)) {
        message = 'position.game-over';
      } else if (!goalAchieved)
        message = 'position.keep-practicing';
      else if (this.position && this.assistanceUsed)
        message = 'position.used-assistance';
      else if (this.position && record) {
        this.mustShowExitDialog = false;
        inviteNextPuzzle = !(this.idxCategory.value === categoryCount - 1 && this.idxSubcategory.value === this.idxLastSubcategory.value && this.idxGame.value === this.idxLastGame.value);
        message = 'position.new-record';
      } else {
        this.mustShowExitDialog = false;
        inviteNextPuzzle = (this.position != undefined || this.checkmateMoves.value > 0) && !(this.idxCategory.value === categoryCount - 1 && this.idxSubcategory.value === this.idxLastSubcategory.value && this.idxGame.value === this.idxLastGame.value);
        message = 'position.goal-achieved';
      }

      alertController.create({
        header: window.AlpineI18n.t(header),
        message: window.AlpineI18n.t(`${message}`),
        buttons: inviteNextPuzzle ?
          [
            {
              text: window.AlpineI18n.t('position.review'),
              cssClass: 'overlay-button'
            },
            {
              text: window.AlpineI18n.t('position.next-puzzle'),
              cssClass: 'overlay-button',
              handler: () => { this.showNextPosition(); }
            }
          ]
          :
          [
            {
              text: window.AlpineI18n.t('position.ok'),
              cssClass: 'overlay-button'
            }
          ]
      }).then(alert => alert.present());
    }
    return result;
  }

  private getHint() {
    this.askingForHint.value = true;
    this.getOpponentMove();
  }

  private solve() {
    this.solving.value = true;
    this.getOpponentMove();
  }

  private getOpponentMove() {
    if (this.stopping.value && this.chess.turn() == this.player) {
      this.stopping.value = false;
      this.waitingForOpponent.value = false;
      this.askingForHint.value = false;
      this.solving.value = false;
      this.solvingTrivial = false;
      redrawIconImages();
      return;
    }
    let moveFunk;
    let wait = false;
    this.mateDistance = 0;
    // not use syzygy when solving a trivial position
    if (!this.solvingTrivial && this.useSyzygy && pieceTotalCount(this.chess.fen()) <= 7) {
      moveFunk = this.getSyzygyMove;
      wait = this.solving.value;
    } else {
      moveFunk = this.getStockfishMove;
    }
    if (wait) setTimeout(() => { moveFunk.call(this); }, 500);
    else moveFunk.call(this);
  }

  private async processOpponentMove(from: string, to: string, promotion: string | undefined) {
    if (this.stockfishWarmup) {
      await stockfishService.stopWarmup().then(() => this.stockfishWarmup = false);
    }
    this.waitingForOpponent.value = false;
    if (!this.solvingTrivial && (this.askingForHint.value || this.solving.value)) this.assistanceUsed = true;
    redrawIconImages();
    if (this.askingForHint.value) {
      this.board.setShapes([{ orig: from as Key, dest: to as Key, brush: 'blue' }]);
      this.askingForHint.value = false;
      return;
    }
    const promo = (promotion == 'r' || promotion == 'n' || promotion == 'b' || promotion == 'q') ? promotion : undefined;
    this.board.move(from as Key, to as Key);
    const prevFen = this.chess.fen();
    this.chess.move({ from: from as Square, to: to as Square, promotion: promo });

    this.updateMoveList(prevFen);

    const ended = this.checkEnding();
    const turn = this.chess.turn() == 'w' ? 'white' : 'black';
    this.board.set({
      fen: this.chess.fen(),
      turnColor: turn,
      viewOnly: ended,
      movable: {
        color: turn,
        dests: this.toDests()
      }
    });
    if (!ended) {
      soundService.playAudio('move');
      if (this.solving.value) {
        this.getOpponentMove();
      } else if (!this.trivialPositionInvitationShown && this.isTrivialPosition()) {
        this.trivialPositionInvitationShown = true;
        alertController.create({
          header: window.AlpineI18n.t('position.confirm-trivial-position.header'),
          message: window.AlpineI18n.t('position.confirm-trivial-position.message'),
          buttons: [
            {
              text: window.AlpineI18n.t('position.confirm-trivial-position.no'),
              role: 'cancel',
              cssClass: 'overlay-button',
              handler: () => {

              }
            }, {
              text: window.AlpineI18n.t('position.confirm-trivial-position.yes'),
              cssClass: 'overlay-button',
              handler: () => {
                this.solvingTrivial = true;
                this.solve();
              }
            }
          ]
        }).then(alert => alert.present());
      } else if (this.mateDistance != 0) {
        if (this.player == 'w' && this.mateDistance > 0 || this.player == 'b' && this.mateDistance < 0) {
          toastController.create({
            message: window.AlpineI18n.t('position.mate-in', { moves: Math.abs(this.mateDistance) }),
            position: window.matchMedia("(orientation: portrait)").matches ? 'top' : 'bottom',
            positionAnchor: '__chessboard__',
            animated: false,
            color: 'medium',
            duration: 1000
          }).then(toast => toast.present());
        } else {
          toastController.create({
            message: window.AlpineI18n.t('position.receive-mate-in', { moves: Math.abs(this.mateDistance) }),
            position: window.matchMedia("(orientation: portrait)").matches ? 'top' : 'bottom',
            positionAnchor: '__chessboard__',
            animated: false,
            color: 'warning',
            duration: 1000
          }).then(toast => toast.present());
        }
      } else if (this.unfeasibleMate && this.target.value == 'checkmate' && this.move.value.startsWith(this.player)) {
        toastController.create({
          message: window.AlpineI18n.t('position.unfeasible-mate'),
          position: window.matchMedia("(orientation: portrait)").matches ? 'top' : 'bottom',
          positionAnchor: '__chessboard__',
          animated: false,
          color: 'warning',
          duration: 1000
        }).then(toast => toast.present());
      }
    }
  }

  private getSyzygyMove() {
    this.waitingForOpponent.value = true;
    redrawIconImages();
    syzygyService.get(this.chess.fen())
      .then(response => response.json().then(data => {
        if (!this.waitingForOpponent.value) return;
        if ((queryParam('debug') == 'true')) console.log(JSON.stringify(data));
        if (this.target.value == 'checkmate' && data.category != 'loss') this.unfeasibleMate = true;
        // stockfish search more interesting lines when there aren't any winning line
        if (data.category == 'unknown' || data.category == 'loss' || (data.category == 'draw' /*&& data.moves.every((move: { category: string }) => move.category === "draw")*/)) {
          this.getStockfishMove();
        } else {
          const bestmove = data.moves[0].uci;
          let match = bestmove.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?/);
          const from = match[1];
          const to = match[2];
          const promotion = match[3];
          if (data.moves[0].dtm) this.mateDistance = data.moves[0].dtm * (this.chess.turn() == this.player ? -1 : 1) * (this.player == 'b' ? -1 : 1);
          this.processOpponentMove(from, to, promotion);
        }
      })
      ).catch((_err) => {
        this.useSyzygy = false;
        toastController.create({
          message: window.AlpineI18n.t('position.syzygy-error'),
          position: window.matchMedia("(orientation: portrait)").matches ? 'top' : 'bottom',
          positionAnchor: '__chessboard__',
          animated: false,
          color: 'warning',
          duration: 2000
        }).then(toast => toast.present());
        this.getStockfishMove();
      });
  }

  private async getStockfishMove() {
    if (this.stockfishWarmup) {
      await stockfishService.stopWarmup().then(() => this.stockfishWarmup = false);
    }
    const history = this.chess.history({ verbose: true });
    let moves = '';
    history.forEach(move => moves += ` ${move.from}${move.to}${move.promotion || ''}`);
    const command = `position fen ${this.fen.value} ${moves ? 'moves ' + moves : ''}`;
    stockfishService.postMessage(command);
    this.waitingForOpponent.value = true;
    redrawIconImages();
    if (!this.stockfishWarningShowed) {
      this.stockfishWarnTimeout = setTimeout(() => {
        this.stockfishWarningShowed = true;
        this.stockfishWarnTimeout = null;
        toastController.create({
          message: window.AlpineI18n.t('position.stockfish-slow'),
          position: window.matchMedia("(orientation: portrait)").matches ? 'top' : 'bottom',
          positionAnchor: '__chessboard__',
          animated: false,
          color: 'warning',
          duration: 3000
        }).then(toast => toast.present());
      }, 5000);
    }
    if (this.solvingTrivial) {
      stockfishService.postMessage('go depth 60 movetime 1000');
    } else {
      stockfishService.postMessage(`go depth ${configurationService.configuration.stockfishDepth} movetime ${1000 * configurationService.configuration.stockfishMovetime}`);
    }
  }

  private stockfishMessage(message: string) {
    if (!this.waitingForOpponent.value) return;
    let match;
    if (match = message.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {
      if (this.stockfishWarnTimeout) {
        clearTimeout(this.stockfishWarnTimeout);
        this.stockfishWarnTimeout = null;
      }
      const from = match[1];
      const to = match[2];
      const promotion = (match[3] == 'r' || match[3] == 'n' || match[3] == 'b' || match[3] == 'q') ? match[3] : undefined;
      this.processOpponentMove(from, to, promotion);
    } else if (match = message.match(/^info .*\bscore (\w+) (-?\d+)/)) {
      const score = parseInt(match[2]) * (this.chess.turn() == 'w' ? 1 : -1);
      if (match[1] == 'mate') {
        if (this.mateDistance == 0 || Math.abs(score) < this.mateDistance) this.mateDistance = score;
      } else if (this.target.value == 'checkmate') {
        this.unfeasibleMate = (score < 15);
      }
    }
  }

  private copyToClipboard(what: string, text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    this.showToastClipboard(what);
  }

  private cropImage(base64: string, width: number, height: number): Promise<string> {
    return new Promise<string>(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height, 0, 0, width, height);
        const result = canvas.toDataURL('image/png');
        canvas.remove();
        resolve(result);
      };
      img.src = base64;
    });
  }

  private saveBase64AsFile(base64: string, fileName: string) {
    const link = document.createElement("a");
    document.body.appendChild(link); // for Firefox
    link.setAttribute("href", base64);
    link.setAttribute("download", fileName);
    link.click();
    this.showToastClipboard('img');
  }

  private async showToastClipboard(what: string) {
    toastController.create({
      message: window.AlpineI18n.t(`position.clipboard.${what}`),
      position: 'middle',
      color: 'success',
      duration: 1000
    }).then(toast => toast.present());
  }

  getSEOParams(): any {
    return { 'kind': this.seo };
  }

  private showExitDialog(): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      if ((this.moveList.length == 1 && this.moveList[0].length == 0) || !this.mustShowExitDialog) {
        this.waitingForOpponent.value = false;
        this.solving.value = false;
        if (this.stockfishWarmup) {
          stockfishService.stopWarmup().then(() => {
            this.stockfishWarmup = false;
            resolve(true);
          });
        } else {
          this.stopping.value = true;
          this.stopStockfish();
          resolve(true);
        }
        return;
      }
      const alert = await alertController.create({
        header: window.AlpineI18n.t('position.confirm-exit.header'),
        message: window.AlpineI18n.t('position.confirm-exit.message'),
        buttons: [
          {
            text: window.AlpineI18n.t('position.confirm-exit.no'),
            role: 'cancel',
            cssClass: 'overlay-button',
            handler: () => {
              resolve(false);
            }
          }, {
            text: window.AlpineI18n.t('position.confirm-exit.yes'),
            cssClass: 'overlay-button',
            handler: () => {
              this.waitingForOpponent.value = false;
              this.solving.value = false;
              if (this.stockfishWarmup) {
                stockfishService.stopWarmup().then(() => { this.stockfishWarmup = false; resolve(true); });
              } else {
                this.stopping.value = true;
                redrawIconImages();
                this.stopStockfish();
                resolve(true);
              }
            }
          }
        ]
      });
      alert.present();
    });
  }

  onExit(): Promise<boolean> {
    return this.showExitDialog().then((result) => {
      if (result) {
        this.stopStockfish();
        menuController.get(MAIN_MENU_ID).then(function (menu) {
          if (menu) menu.swipeGesture = true;
        });
        releaseWakeLock();
      }
      return result;
    });

  }

}

export const positionController = new PositionController();
