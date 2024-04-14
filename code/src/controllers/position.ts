import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, redrawIconImages, routeService, soundService, stockfishService, syzygyService } from '../services';
import { MAIN_MENU_ID, ariaDescriptionFromIcon, clone, urlIcon } from '../commons';
import { Category, EndgameDatabase, MoveItem, Position, Subcategory } from '../model';
import { Chess, ChessInstance, PieceType, SQUARES, Square } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { colors, MoveMetadata, Color, Key } from 'chessground/types';
import { Config } from 'chessground/config';
import { promotionController } from './promotion';
import { alertController, menuController, toastController } from '@ionic/core';

class PositionController extends BaseController {

  private seo!: string;
  private chess: ChessInstance = Chess();
  private board!: Api;
  private boardConfig!: Config;
  private fen!: string;
  private moveList: MoveItem[] = Alpine.reactive([]);
  private movePointer: { value: number } = Alpine.reactive({ value: -1 });
  private player!: "white" | "black";
  //private engine!: "white" | "black";
  private target!: string;
  private useSyzygy = false;
  private gameOver = Alpine.reactive({ value: false });
  private waitingForOpponent = Alpine.reactive({ value: false });
  private askingForHint = Alpine.reactive({ value: false });

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
    const infoTarget = document.getElementById('info_target') as HTMLElement;
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
    infoMoves.style.height = `${infoWrapper.clientHeight - (infoTarget.clientHeight)}px`;
    actionButtons.style.width = infoWrapper.style.width;
  }

  private toDests(): Map<Key, Key[]> {
    const dests = new Map();
    SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
  }

  private resetPosition() {
    this.waitingForOpponent.value = false;
    redrawIconImages();
    this.gameOver.value = false;
    stockfishService.postMessage('stop');
    this.chess.load(this.fen);
    const turn = this.chess.turn() === 'w' ? 'white' : 'black';
    this.board.set({
      fen: this.chess.fen(),
      turnColor: turn,
      lastMove: [],
      viewOnly: false,
      movable: {
        dests: this.toDests()
      }
    });
    this.moveList.splice(0, this.moveList.length);
    this.movePointer.value = -1;
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
            this.resetPosition();
          }
        }
      ]
    }).then(alert => alert.present());
  }

  private showPruneDialog(idx: number) {
    alertController.create({
      header: window.AlpineI18n.t('position.confirm-prune.header'),
      message: window.AlpineI18n.t('position.confirm-prune.message'),
      buttons: [
        {
          text: window.AlpineI18n.t('position.confirm-prune.no'),
          role: 'cancel',
          cssClass: 'overlay-button',
          handler: () => {
          }
        }, {
          text: window.AlpineI18n.t('position.confirm-prune.yes'),
          cssClass: 'overlay-button',
          handler: () => {
            this.pruneMove(idx);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  private pruneMove(idx: number) {
    const order = this.moveList[idx].order;
    do {
      this.moveList.splice(idx, 1);
    } while(this.moveList.length > idx && this.moveList[idx].order > order);
    this.gotoMove(idx-1);
  }

  private gotoMove(idx: number) {
    if (idx >= 0 && !this.moveList[idx].fen) return;
    this.movePointer.value = idx;
    this.waitingForOpponent.value = false;
    redrawIconImages();
    this.gameOver.value = false;
    stockfishService.postMessage('stop');
    this.chess.load(idx == -1 ? this.fen : this.moveList[idx].fen);
    const turn = this.chess.turn() === 'w' ? 'white' : 'black';
    this.board.set({
      fen: this.chess.fen(),
      turnColor: turn,
      lastMove: [],
      viewOnly: this.chess.game_over(),
      movable: {
        dests: this.toDests()
      }
    });
  }

  private stop() {
    this.waitingForOpponent.value = false;
    this.askingForHint.value = false;
    redrawIconImages();
    stockfishService.postMessage('stop');
  }

  onEnter($routeParams?: any): void {
    const self = this;
    menuController.get(MAIN_MENU_ID).then(function (menu) {
      if (menu) menu.swipeGesture = false;
    });
    this.useSyzygy = configurationService.configuration.useSyzygy;
    const endgameDatabase = endgameDatabaseService.endgameDatabase;
    let categories = endgameDatabase.categories;
    let idxCategory: number;
    let idxSubcategory: number;
    let category: Category;
    let subcategory: Subcategory;
    let idxGame: number;
    let game: Position;
    let idxLastSubcategory: number;
    let idxLastGame: number;

    const customFen = ($routeParams['fen1'] !== undefined);
    if (customFen) {
      this.fen = `${$routeParams['fen1']}/${$routeParams['fen2']}/${$routeParams['fen3']}/${$routeParams['fen4']}/${$routeParams['fen5']}/${$routeParams['fen6']}/${$routeParams['fen7']}/${$routeParams['fen8']}`;
      this.target = $routeParams['target'];
      this.seo = this.fen;
    } else {
      idxCategory = parseInt($routeParams['idxCategory']);
      idxSubcategory = parseInt($routeParams['idxSubcategory']);
      category = categories[idxCategory];
      subcategory = category.subcategories[idxSubcategory];
      idxGame = parseInt($routeParams['idxGame']);
      game = subcategory.games[idxGame];
      idxLastSubcategory = category.count - 1;
      idxLastGame = subcategory.count - 1;
      this.fen = game.fen;
      this.target = game.target;
      this.seo = `${window.AlpineI18n.t(`category.${category.name}`)} (${subcategory.name}) ${idxGame + 1}/${idxLastGame + 1}`;
    }

    this.chess.load(this.fen);
    this.moveList.splice(0, this.moveList.length);
    this.movePointer.value = -1;

    const turnWhite = this.chess.turn() == 'w';
    const turnColor: Color = (turnWhite ? 'white' : 'black');
    this.player = turnColor;
    //this.engine = this.player == 'white' ? 'black' : 'white';
    const move = (turnWhite ? 'white' : 'black');
    const targetImage = urlIcon(turnWhite ? 'wK.svg' : 'bK.svg', configurationService.configuration.pieceTheme);
    this.boardConfig = {
      fen: this.chess.fen(),
      orientation: (this.chess.turn() == 'w' ? colors[0] : colors[1]),
      viewOnly: false,
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
      boardTheme: configurationService.configuration.boardTheme,
      pieceTheme: configurationService.configuration.pieceTheme,
      customFen: customFen,
      fen: this.fen,
      target: this.target,
      idxCategory: idxCategory,
      idxSubcategory: idxSubcategory,
      idxGame: idxGame,
      category: category,
      subcategory: subcategory,
      game: game,
      moveList: self.moveList,
      movePointer: self.movePointer,
      move: move,
      targetImage: targetImage,
      idxLastSubcategory: idxLastSubcategory,
      idxLastGame: idxLastGame,
      showNavPrev: idxSubcategory > 0 || idxCategory > 0 || idxGame > 0,
      showNavNext: !(idxCategory === endgameDatabase.count - 1 && idxSubcategory === idxLastSubcategory && idxGame === idxLastGame),
      listUrl: `/list/${idxCategory}/${idxSubcategory}`,
      ariaDescriptionFromIcon: ariaDescriptionFromIcon,
      chess: this.chess,
      showPreviousPosition() {
        if (this.idxSubcategory > 0 || this.idxCategory > 0 || this.idxGame > 0) {
          self.onExit().then(value => {
            if (value) {
              menuController.get(MAIN_MENU_ID).then(function (menu) {
                if (menu) menu.swipeGesture = false;
              });
              this.idxGame--;
              if (this.idxGame < 0) {
                this.idxSubcategory--;
                if (this.idxSubcategory < 0) {
                  this.idxCategory--;
                  this.idxSubcategory = categories[this.idxCategory].count - 1;
                  this.idxLastSubcategory = this.idxSubcategory;
                }
                this.idxGame = categories[this.idxCategory].subcategories[this.idxSubcategory].count - 1;
                this.idxLastGame = this.idxGame;
              }
              this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0 || this.idxGame > 0;
              this.showNavNext = true;
              self.fen = categories[this.idxCategory].subcategories[this.idxSubcategory].games[this.idxGame].fen;
              self.resetPosition.call(self);
            }
          });
        }
      },
      showNextPosition() {
        if (!(this.idxCategory === endgameDatabase.count - 1 && this.idxSubcategory === this.idxLastSubcategory && this.idxGame === this.idxLastGame)) {
          self.onExit().then(value => {
            if (value) {
              menuController.get(MAIN_MENU_ID).then(function (menu) {
                if (menu) menu.swipeGesture = false;
              });
              this.idxGame++;
              if (this.idxGame > this.idxLastGame) {
                this.idxSubcategory++;
                if (this.idxSubcategory > this.idxLastSubcategory) {
                  this.idxCategory++;
                  this.idxSubcategory = 0;
                  this.idxLastSubcategory = categories[this.idxCategory].count - 1;
                }
                this.idxGame = 0;
                this.idxLastGame = categories[this.idxCategory].subcategories[this.idxSubcategory].count - 1;
              }
              this.showNavPrev = true;
              this.showNavNext = !(this.idxCategory === endgameDatabase.count - 1 && this.idxSubcategory === this.idxLastSubcategory && this.idxGame === this.idxLastGame);
              self.fen = categories[this.idxCategory].subcategories[this.idxSubcategory].games[this.idxGame].fen;
              self.resetPosition.call(self);
            }
          });
        }
      },
      showRestartDialog() {
        self.showRestartDialog.call(self);
      },
      gotoMove(idx: number) {
        self.gotoMove.call(self, idx);
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
      init() {
        self.board = Chessground(document.getElementById('__chessboard__') as HTMLElement, self.boardConfig);
        // resize the board on the next tick, when the DOM of the chessboard has been loaded
        requestAnimationFrame(() => {
          self.resizeBoard();
        });
        this.$watch('movePointer', (_value) => {
          const movelist = document.querySelector('.info_moves') as HTMLIonListElement;
          const item = document.getElementById(`item-${this.movePointer.value}`) as HTMLElement;
          if (item) {
            const y = item.offsetHeight * (this.movePointer.value);
            movelist.scrollTo({ top: y, behavior: 'smooth' });
          }
        });
        endgameDatabaseService.endgameDatabaseChangedEmitter.addEventListener((database: EndgameDatabase) => {
          const categories = database.categories;
          this.category = clone(categories[idxCategory]);
          this.subcategory = clone(this.category.subcategories[idxSubcategory]);
          this.game = clone(this.subcategory.games[idxGame]);
        });
        configurationService.configuration.configurationChangedEmitter.addEventListener((event) => {
          switch (event.field) {
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
      routeService.openModal('promotion', 'promotion.html', promotionController, false, true, this.player[0]).then((data: any) => {
        this.registerMove(orig, dest, data.piece);
      });
    } else {
      this.registerMove(orig, dest, undefined);
    }
  }

  private registerMove(source: Square, target: Square, promotion: Exclude<PieceType, "p" | "k"> | undefined) {
    const prevFen = this.chess.fen();
    this.chess.move({
      from: source,
      to: target,
      promotion: promotion
    });
    if (promotion)
      this.board.set({ fen: this.chess.fen() });
    console.log(this.chess.fen());

    const history = this.chess.history();
    // look for moveItem
    const itemOrder = this.movePointer.value >= 0 ? this.moveList[this.movePointer.value].order + 1 : 1;
    const move1 = history[history.length - 1];
    const itemIndex = this.moveList.findIndex(item => item.order == itemOrder && item.move1 == move1 && item.prevFen == prevFen);
    if (itemIndex > -1) {
      this.movePointer.value = itemIndex;
    } else {
      const moveItem: MoveItem = {
        order: itemOrder,
        move1: move1,
        move2: '',
        prevFen: prevFen,
        fen: ''
      };
      if (this.movePointer.value === this.moveList.length - 1) {
        // If movePointer is pointing to the last item, simply push the new item to the end of the array
        this.moveList.push(moveItem);
        // Update movePointer to point to the newly added item
        this.movePointer.value = this.moveList.length - 1;
      } else {
        // If movePointer is pointing to any other item, insert the new item after the current one
        this.moveList.splice(this.movePointer.value + 1, 0, moveItem);
        // Update movePointer to point to the newly added item
        this.movePointer.value++;
      }
    }
    if (!this.checkEnding()) {
      soundService.playAudio('move');
      this.getOpponentMove();
    } else {
      this.moveList[this.movePointer.value].fen = this.chess.fen();
    }
  }

  private checkEnding(): boolean {
    const result = this.chess.game_over();
    if (result) {
      this.gameOver.value = true;
      if ('checkmate' !== this.target && !this.chess.in_checkmate() ||
        'checkmate' === this.target && this.chess.in_checkmate() && !this.player.startsWith(this.chess.turn())) {
        soundService.playAudio('success');
      } else {
        soundService.playAudio('fail');
      }

      let message;
      if (this.chess.in_checkmate())
        message = 'position.checkmate';
      else if (this.chess.in_stalemate())
        message = 'position.stalemate';
      else if (this.chess.insufficient_material())
        message = 'position.insufficent-material';
      else if (this.chess.in_threefold_repetition())
        message = 'position.three-repetition';
      else if (this.chess.in_draw())
        message = 'position.rule-fifty';
      else
        message = 'position.game-over';

      alertController.create({
        header: window.AlpineI18n.t('position.game-over'),
        message: window.AlpineI18n.t(`${message}`),
        buttons: [
          {
            text: window.AlpineI18n.t('position.ok'),
            cssClass: 'overlay-button'
          }
        ]
      }).then(alert => alert.present());

    }
    return result;
  }


  private numberOfPieces(fen: string) {
    return fen.substring(0, fen.indexOf(" ")).replace(/\d/g, "").replace(/\//g, "").length;
  }

  private getOpponentMove() {
    let moveFunk;
    if (this.useSyzygy && this.numberOfPieces(this.chess.fen()) <= 7) {
      moveFunk = this.getSyzygyMove;
    } else {
      moveFunk = this.getStockfishMove;
    }
    moveFunk.call(this);
  }

  private getHint() {
    this.askingForHint.value = true;
    this.getOpponentMove();
    /*
    let hintFunk;
    if (this.useSyzygy && this.numberOfPieces(this.chess.fen()) <= 7) {
      hintFunk = this.getSyzygyHint;
    } else {
      hintFunk = this.getStockfishHint;
    }
    hintFunk.call(this);
    */
  }

  private getSyzygyMove() {
    this.waitingForOpponent.value = true;
    redrawIconImages();
    syzygyService.get(this.chess.fen())
      .then(response => response.json().then(data => {
        if (!this.waitingForOpponent.value) return;
        this.waitingForOpponent.value = false;
        redrawIconImages();
        console.log(JSON.stringify(data));
        const bestmove = data.moves[0].uci;
        let match = bestmove.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?/);
        const from = match[1];
        const to = match[2];
        if (this.askingForHint.value) {
          this.board.setShapes([{ orig: from, dest: to, brush: 'blue' }]);
          this.askingForHint.value = false;
          return;
        }
        const promotion = match[3];
        this.board.move(from as Key, to as Key);
        this.chess.move({ from: from as Square, to: to as Square, promotion: promotion });
        const turn = this.chess.turn() === 'w' ? 'white' : 'black';
        this.board.set({
          fen: this.chess.fen(),
          turnColor: turn,
          movable: {
            dests: this.toDests()
          }
        });
        console.log(this.chess.fen());

        const history = this.chess.history();
        const move = this.moveList[this.movePointer.value];
        move.move2 = history[history.length - 1];
        move.fen = this.chess.fen();
        console.log(`moveList=${JSON.stringify(this.moveList)}`);

        if (this.checkEnding()) {
          this.board.set({ viewOnly: true });
        } else {
          soundService.playAudio('move');
        }
      })
      ).catch((_err) => {
        this.useSyzygy = false;
        toastController.create({
          message: window.AlpineI18n.t('position.syzygy-error'),
          position: 'middle',
          color: 'warning',
          duration: 2000
        }).then(toast => toast.present());
        this.getStockfishMove();
      });

    /*
{
  "checkmate": false,
  "stalemate": false,
  "variant_win": false,
  "variant_loss": false,
  "insufficient_material": false,
  "dtz": -14,
  "precise_dtz": -14,
  "dtm": -14,
  "category": "loss",
  "moves": [
    {
      "uci": "d7c7",
      "san": "Kc7",
      "zeroing": false,
      "checkmate": false,
      "stalemate": false,
      "variant_win": false,
      "variant_loss": false,
      "insufficient_material": false,
      "dtz": 13,
      "precise_dtz": 13,
      "dtm": 13,
      "category": "win"
    },
    {
      "uci": "d7e7",
      "san": "Ke7",
      "zeroing": false,
      "checkmate": false,
      "stalemate": false,
      "variant_win": false,
      "variant_loss": false,
      "insufficient_material": false,
      "dtz": 13,
      "precise_dtz": 13,
      "dtm": 13,
      "category": "win"
    },
    {
      "uci": "d7c8",
      "san": "Kc8",
      "zeroing": false,
      "checkmate": false,
      "stalemate": false,
      "variant_win": false,
      "variant_loss": false,
      "insufficient_material": false,
      "dtz": 11,
      "precise_dtz": 11,
      "dtm": 11,
      "category": "win"
    },
    {
      "uci": "d7d8",
      "san": "Kd8",
      "zeroing": false,
      "checkmate": false,
      "stalemate": false,
      "variant_win": false,
      "variant_loss": false,
      "insufficient_material": false,
      "dtz": 11,
      "precise_dtz": 11,
      "dtm": 11,
      "category": "win"
    },
    {
      "uci": "d7e8",
      "san": "Ke8",
      "zeroing": false,
      "checkmate": false,
      "stalemate": false,
      "variant_win": false,
      "variant_loss": false,
      "insufficient_material": false,
      "dtz": 11,
      "precise_dtz": 11,
      "dtm": 11,
      "category": "win"
    }
  ]
}
    */
  }

  private getStockfishMove() {
    stockfishService.postMessage(`position fen ${this.chess.fen()}`);
    this.waitingForOpponent.value = true;
    redrawIconImages();
    stockfishService.postMessage(`go depth ${configurationService.configuration.stockfishDepth} movetime ${configurationService.configuration.stockfishMovetime * 1000}`);
  }

  private stockfishMessage(message: string) {
    if (!this.waitingForOpponent.value) return;
    //console.log(`STOCKFISH: ${message}`);
    let match;
    if (match = message.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {
      this.waitingForOpponent.value = false;
      redrawIconImages();
      const from = match[1];
      const to = match[2];
      if (this.askingForHint.value) {
        this.board.setShapes([{ orig: from as Key, dest: to as Key, brush: 'blue' }]);
        this.askingForHint.value = false;
        return;
      }
      const promotion = (match[3] == 'r' || match[3] == 'n' || match[3] == 'b' || match[3] == 'q') ? match[3] : undefined;
      this.board.move(from as Key, to as Key);
      this.chess.move({ from: from as Square, to: to as Square, promotion: promotion });
      const turn = this.chess.turn() === 'w' ? 'white' : 'black';
      // this.board.set({
      //   fen: this.chess.fen(),
      //   turnColor: turn,
      //   movable: {
      //     dests: this.toDests()
      //   }
      // });
      this.board.set({
        fen: this.chess.fen(),
        turnColor: turn,
        movable: {
          color: turn,
          dests: this.toDests()
        }
      });
      console.log(this.chess.fen());

      const history = this.chess.history();
      const move = this.moveList[this.movePointer.value];
      move.move2 = history[history.length - 1];
      move.fen = this.chess.fen();

      if (this.checkEnding()) {
        this.board.set({ viewOnly: true });
      } else {
        soundService.playAudio('move');
      }
    }
  }

  getSEOParams(): any {
    return { 'kind': this.seo };
  }

  onExit(): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      if (this.moveList.length == 0) {
        resolve(true);
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
              redrawIconImages();
              stockfishService.postMessage('stop');
              menuController.get(MAIN_MENU_ID).then(function (menu) {
                if (menu) menu.swipeGesture = true;
              });
              resolve(true);
            }
          }
        ]
      });
      alert.present();
    });
  }

}

export const positionController = new PositionController();
