import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, redrawIconImages, releaseWakeLock, requestWakeLock, routeService, soundService, stockfishService, syzygyService } from '../services';
import { MAIN_MENU_ID, ariaDescriptionFromIcon, clone, pieceCount, pieceTotalCount, setupSEO } from '../commons';
import { Category, EndgameDatabase, MoveItem, Position, Subcategory } from '../model';
import { Chess, ChessInstance, PieceType, SQUARES, Square } from 'chess.js';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { MoveMetadata, Color, Key } from 'chessground/types';
import { Config } from 'chessground/config';
import { promotionController } from './promotion';
import { alertController, menuController, toastController } from '@ionic/core';

class PositionController extends BaseController {

  private seo!: string;
  private chess: ChessInstance = Chess();
  private board!: Api;
  private boardConfig!: Config;
  private position!: Position;
  private fen!: string;
  private moveList: MoveItem[] = Alpine.reactive([]);
  private movePointer: { value: number } = Alpine.reactive({ value: -1 });
  private player!: "w" | "b";
  private target = Alpine.reactive({ value: '' });
  private move = Alpine.reactive({ value: '' });
  private useSyzygy = false;
  private gameOver = Alpine.reactive({ value: false });
  private waitingForOpponent = Alpine.reactive({ value: false });
  private askingForHint = Alpine.reactive({ value: false });
  private solving = Alpine.reactive({ value: false });
  private solvingTrivial = false;
  private assistanceUsed = false;
  private trivialPositionInvitationShown = false;
  private mateDistance = 0;
  private manualMode = Alpine.reactive({ value: false });
  private mustShowExitDialog = true;

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

  private resetPosition() {
    this.waitingForOpponent.value = false;
    redrawIconImages();
    stockfishService.postMessage('stop');
    this.chess.load(this.fen);
    this.gameOver.value = false;
    this.player = this.chess.turn();
    const turn = this.player == 'w' ? 'white' : 'black';
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
    if (this.board.state.orientation != turn)
      this.board.toggleOrientation();
    this.moveList.splice(0, this.moveList.length);
    this.movePointer.value = -1;
    this.assistanceUsed = false;
    this.solvingTrivial = false;
    this.trivialPositionInvitationShown = this.isTrivialPosition();
    this.manualMode.value = false;
    this.mustShowExitDialog = true;
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
    if (this.solving.value || this.waitingForOpponent.value) return;
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
    } while (this.moveList.length > idx && this.moveList[idx].order > order);
    this.gotoMove(idx - 1);
  }

  private gotoMove(idx: number) {
    if (this.solving.value || this.waitingForOpponent.value) return;
    if (idx >= 0 && !this.moveList[idx].fen2) return;
    this.movePointer.value = idx;
    redrawIconImages();
    stockfishService.postMessage('stop');
    if (idx > -1) {
      const move = this.moveList[idx];
      this.chess.load(move.prevFen);
      this.gameOver.value = this.chess.game_over();
      const turn = this.chess.turn() == 'w' ? 'white' : 'black';
      this.board.set({
        fen: this.chess.fen(),
        turnColor: turn,
        lastMove: [],
        viewOnly: this.gameOver.value,
        movable: {
          dests: this.toDests()
        }
      });
      setTimeout(() => {
        this.chess.load(move.fen1);
        this.gameOver.value = this.chess.game_over();
        const turn = this.chess.turn() == 'w' ? 'white' : 'black';
        this.board.set({
          fen: this.chess.fen(),
          turnColor: turn,
          lastMove: [move.from1 as Key, move.to1 as Key],
          viewOnly: this.gameOver.value,
          movable: {
            dests: this.toDests()
          }
        });
        setTimeout(() => {
          this.chess.load(move.fen2);
          this.gameOver.value = this.chess.game_over();
          const turn = this.chess.turn() == 'w' ? 'white' : 'black';
          this.board.set({
            fen: this.chess.fen(),
            turnColor: turn,
            lastMove: [move.from2 as Key, move.to2 as Key],
            viewOnly: this.gameOver.value,
            movable: {
              color: turn,
              dests: this.toDests()
            }
          });
        }, 200);
      }, 200);
    } else {
      this.chess.load(this.fen);
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
    }
  }

  private stop() {
    this.waitingForOpponent.value = false;
    this.askingForHint.value = false;
    this.solving.value = false;
    this.solvingTrivial = false;
    redrawIconImages();
    stockfishService.postMessage('stop');
    if (!this.moveList[this.movePointer.value].move2) {
      this.pruneMove(this.movePointer.value);
    }
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
    const endgameDatabase = endgameDatabaseService.endgameDatabase;
    let categories = endgameDatabase.categories;
    let idxCategory: number;
    let idxSubcategory: number;
    let category: Category;
    let subcategory: Subcategory;
    let idxGame: number;
    let idxLastSubcategory: number;
    let idxLastGame: number;

    const customFen = ($routeParams['fen1'] !== undefined);
    if (customFen) {
      this.fen = `${$routeParams['fen1']}/${$routeParams['fen2']}/${$routeParams['fen3']}/${$routeParams['fen4']}/${$routeParams['fen5']}/${$routeParams['fen6']}/${$routeParams['fen7']}/${$routeParams['fen8']}`;
      this.target.value = $routeParams['target'] || 'checkmate';
      this.seo = this.fen;
    } else {
      idxCategory = parseInt($routeParams['idxCategory']);
      idxSubcategory = parseInt($routeParams['idxSubcategory']);
      category = categories[idxCategory];
      subcategory = category.subcategories[idxSubcategory];
      idxGame = parseInt($routeParams['idxGame']);
      this.position = subcategory.games[idxGame];
      idxLastSubcategory = category.count - 1;
      idxLastGame = subcategory.count - 1;
      this.fen = this.position.fen;
      this.target.value = this.position.target;
      this.seo = `${window.AlpineI18n.t(`category.${category.name}`)} (${subcategory.name}) ${idxGame + 1}/${idxLastGame + 1}`;
    }

    this.chess.load(this.fen);
    this.moveList.splice(0, this.moveList.length);
    this.movePointer.value = -1;
    this.gameOver.value = false;
    this.player = this.chess.turn();
    this.trivialPositionInvitationShown = this.isTrivialPosition();

    const turnWhite = this.chess.turn() == 'w';
    const turnColor: Color = (turnWhite ? 'white' : 'black');
    this.move.value = (turnWhite ? 'white' : 'black');
    this.boardConfig = {
      fen: this.chess.fen(),
      viewOnly: false,
      orientation: turnColor,
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
      target: self.target,
      move: self.move,
      idxCategory: idxCategory,
      idxSubcategory: idxSubcategory,
      idxGame: idxGame,
      category: category,
      subcategory: subcategory,
      game: this.position,
      moveList: self.moveList,
      movePointer: self.movePointer,
      manualMode: self.manualMode,
      idxLastSubcategory: idxLastSubcategory,
      idxLastGame: idxLastGame,
      showNavPrev: idxSubcategory > 0 || idxCategory > 0 || idxGame > 0,
      showNavNext: !(idxCategory === endgameDatabase.count - 1 && idxSubcategory === idxLastSubcategory && idxGame === idxLastGame),
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
        if (self.movePointer.value >= 0 && !self.moveList[self.movePointer.value].move2) self.getOpponentMove();
      },
      movePosition(direction: number) {
        self.showExitDialog().then(value => {
          if (value) {
            this.idxGame += direction;
            if (this.idxGame < 0 || this.idxGame > this.idxLastGame) {
              this.idxSubcategory += direction;
              if (this.idxSubcategory < 0 || this.idxSubcategory > this.idxLastSubcategory) {
                this.idxCategory += direction;
                this.idxSubcategory = direction > 0 ? 0 : categories[this.idxCategory].count - 1;
                this.idxLastSubcategory = categories[this.idxCategory].count - 1;
              }
              this.idxGame = direction > 0 ? 0 : categories[this.idxCategory].subcategories[this.idxSubcategory].count - 1;
              this.idxLastGame = categories[this.idxCategory].subcategories[this.idxSubcategory].count - 1;
            }
            this.showNavPrev = this.idxSubcategory > 0 || this.idxCategory > 0 || this.idxGame > 0;
            this.showNavNext = !(this.idxCategory === endgameDatabase.count - 1 && this.idxSubcategory === this.idxLastSubcategory && this.idxGame === this.idxLastGame);
            self.position = categories[this.idxCategory].subcategories[this.idxSubcategory].games[this.idxGame];
            self.target.value = self.position.target;
            self.fen = self.position.fen;
            self.seo = `${window.AlpineI18n.t(`category.${categories[this.idxCategory].name}`)} (${categories[this.idxCategory].subcategories[this.idxSubcategory].name}) ${this.idxGame + 1}/${this.idxLastGame + 1}`;
            setupSEO('list.html', self.getSEOParams());
            window.history.replaceState(self.seo, self.seo, `/chessendgametraining/#/chessendgametraining/position/${this.idxCategory}/${this.idxSubcategory}/${this.idxGame}`);
            self.resetPosition.call(self);
          }
        });
      },
      showPreviousPosition() {
        const canMovePrevious = this.idxSubcategory > 0 || this.idxCategory > 0 || this.idxGame > 0;
        if (canMovePrevious) {
          this.movePosition(-1);
        }
      },
      showNextPosition() {
        const canMoveNext = !(this.idxCategory === endgameDatabase.count - 1 && this.idxSubcategory === this.idxLastSubcategory && this.idxGame === this.idxLastGame);
        if (canMoveNext) {
          this.movePosition(1);
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
      solve() {
        self.solve.call(self);
      },
      init() {
        self.board = Chessground(document.getElementById('__chessboard__') as HTMLElement, self.boardConfig);
        // resize the board on the next tick, when the DOM of the chessboard has been loaded
        requestAnimationFrame(() => {
          self.resizeBoard();
        });
        this.$nextTick().then(() => { routeService.updatePageLinks(); });
        ['manualMode'].forEach((item) => {
          this.$watch(item, (_value) => {
            redrawIconImages();
          });
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
      routeService.openModal('promotion', 'promotion.html', promotionController, false, true, this.player).then((data: any) => {
        this.registerMove(orig, dest, data.piece);
      });
    } else {
      this.registerMove(orig, dest, undefined);
    }
  }

  private updateMoveList(prevFen: string, from: string, to: string) {
    const history = this.chess.history();
    if (this.chess.turn() == 'w') {
      let move: MoveItem;
      if (this.movePointer.value < 0) {
        move = {
          order: 1,
          prevFen: prevFen,
          move1: '...', from1: '', to1: '', fen1: prevFen,
          move2: '', from2: '', to2: '', fen2: ''
        };
        this.moveList.push(move)
        this.movePointer.value = 0;
      } else {
        move = this.moveList[this.movePointer.value];
      }
      move.move2 = history[history.length - 1];
      move.from2 = from;
      move.to2 = to;
      move.fen2 = this.chess.fen();
    } else {
      // look for moveItem
      const itemOrder = this.movePointer.value >= 0 ? this.moveList[this.movePointer.value].order + 1 : 1;
      const move1 = history[history.length - 1];
      const itemIndex = this.moveList.findIndex(item => item.order == itemOrder && item.move1 == move1 && item.prevFen == prevFen);
      if (itemIndex > -1) {
        this.movePointer.value = itemIndex;
      } else {
        const moveItem: MoveItem = {
          order: itemOrder,
          prevFen: prevFen,
          move1: move1, from1: from, to1: to, fen1: this.chess.fen(),
          move2: '', from2: '', to2: '', fen2: ''
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
      if (this.chess.game_over()) {
        this.moveList[this.movePointer.value].fen2 = this.chess.fen();
      }
    }
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

  private registerMove(source: Square, target: Square, promotion: Exclude<PieceType, "p" | "k"> | undefined) {
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

    this.updateMoveList(prevFen, source, target);

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

      const goalAchieved = ('checkmate' !== this.target.value && !this.chess.in_checkmate() ||
        'checkmate' == this.target.value && this.chess.in_checkmate() && this.player != this.chess.turn());
      const record = goalAchieved && this.position && (!this.position.record || this.position.record < 0 || this.moveList[this.movePointer.value].order < this.position.record);

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
          this.position.record = this.moveList[this.movePointer.value].order;
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
      if (!goalAchieved)
        message = 'position.keep-practicing';
      else if (this.assistanceUsed)
        message = 'position.used-assistance';
      else if (record) {
        this.mustShowExitDialog = false;
        message = 'position.new-record';
      } else {
        this.mustShowExitDialog = false;
        message = 'position.goal-achieved';
      }

      alertController.create({
        header: window.AlpineI18n.t(header),
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

  private getHint() {
    this.askingForHint.value = true;
    this.getOpponentMove();
  }

  private solve() {
    this.solving.value = true;
    this.getOpponentMove();
  }

  private getOpponentMove() {
    let moveFunk;
    let wait = false;
    this.mateDistance = 0;
    if (!this.solvingTrivial && this.useSyzygy && pieceTotalCount(this.chess.fen()) <= 7) {
      moveFunk = this.getSyzygyMove;
      wait = this.solving.value;
    } else {
      moveFunk = this.getStockfishMove;
    }
    if (wait) setTimeout(() => { moveFunk.call(this); }, 500);
    else moveFunk.call(this);
  }

  private processOpponentMove(from: string, to: string, promotion: string | undefined) {
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

    this.updateMoveList(prevFen, from, to);

    if (!ended) {
      soundService.playAudio('move');
      if (this.solving.value) this.getOpponentMove();
      else if (!this.trivialPositionInvitationShown && this.isTrivialPosition()) {
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
            position: 'top',
            color: 'success',
            duration: 1000
          }).then(toast => toast.present());
        } else {
          toastController.create({
            message: window.AlpineI18n.t('position.receive-mate-in'),
            position: 'top',
            color: 'warning',
            duration: 1000
          }).then(toast => toast.present());
        }
      }
    }
  }

  private getSyzygyMove() {
    this.waitingForOpponent.value = true;
    redrawIconImages();
    syzygyService.get(this.chess.fen())
      .then(response => response.json().then(data => {
        if (!this.waitingForOpponent.value) return;
        const bestmove = data.moves[0].uci;
        let match = bestmove.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?/);
        const from = match[1];
        const to = match[2];
        const promotion = match[3];
        if (data.moves[0].dtm) this.mateDistance = data.moves[0].dtm;
        this.processOpponentMove(from, to, promotion);
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
  }

  private getStockfishMove() {
    stockfishService.postMessage(`position fen ${this.chess.fen()}`);
    this.waitingForOpponent.value = true;
    redrawIconImages();
    stockfishService.postMessage(`go depth ${this.solvingTrivial ? 30 : configurationService.configuration.stockfishDepth} movetime ${1000 * (this.solvingTrivial ? 2 : configurationService.configuration.stockfishMovetime)}`);
  }

  private stockfishMessage(message: string) {
    if (!this.waitingForOpponent.value) return;
    let match;
    if (match = message.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {
      const from = match[1];
      const to = match[2];
      const promotion = (match[3] == 'r' || match[3] == 'n' || match[3] == 'b' || match[3] == 'q') ? match[3] : undefined;
      this.processOpponentMove(from, to, promotion);
    } else if (match = message.match(/^info .*\bscore (\w+) (-?\d+)/)) {
      if (match[1] == 'mate') {
        const score = parseInt(match[2]) * (this.chess.turn() == 'w' ? 1 : -1);
        if (this.mateDistance == 0 || Math.abs(score) < this.mateDistance) this.mateDistance = score;
      }
    }
  }

  getSEOParams(): any {
    return { 'kind': this.seo };
  }

  private showExitDialog(): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      if (this.moveList.length == 0 || !this.mustShowExitDialog) {
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
              resolve(true);
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
