import Alpine from 'alpinejs';
import { BaseController } from './controller';
import { configurationService, endgameDatabaseService, routeService, soundService, stockfishService, syzygyService } from '../services';
import { MAIN_MENU_ID, ariaDescriptionFromIcon, clone, urlIcon } from '../commons';
import { Category, EndgameDatabase, Position, Subcategory } from '../model';
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
  private parsedPgn: { value: string[][] } = Alpine.reactive({ value: [] });
  private player!: "white" | "black";
  //private engine!: "white" | "black";
  private target!: string;
  private useSyzygy = false;
  private listeningToStockfish = false;

  constructor() {
    super();
    stockfishService.messageEmitter.addEventListener((message: string) => this.stockfishMessage(message));
  }

  private resizeBoard() {
    const headers = Array.from(document.querySelectorAll('ion-header')) as HTMLElement[];
    const header = headers.find(header => header.clientHeight > 0);
    if (!header) return;
    const container = document.querySelector('.container') as HTMLElement;
    const boardWrapper = document.querySelector('.board_wrapper') as HTMLElement;
    const infoWrapper = document.querySelector('.info_wrapper') as HTMLElement;
    const actionButtons = document.querySelector('.action_buttons') as HTMLElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - header.clientHeight;
    let minSize = Math.min(containerWidth, containerHeight);
    const mod = minSize % 8;
    minSize = minSize - mod;
    boardWrapper.style.height = `${minSize}px`;
    boardWrapper.style.width = `${minSize}px`;
    if (mod > 0) {
      boardWrapper.style.paddingLeft = `${(mod / 2)}px`;
    }
    if (containerWidth > containerHeight) {
      infoWrapper.style.width = `${(containerWidth - minSize - 2)}px`;
      infoWrapper.style.height = '100%';
    } else {
      infoWrapper.style.width = '100%';
      infoWrapper.style.height = `${(containerHeight - minSize - 2)}px`;
    }
    actionButtons.style.width = infoWrapper.style.width;
    const board: any = document.getElementById('__chessboard__');
    board.style.height = `${boardWrapper.clientWidth}px`;
    board.style.width = `${boardWrapper.clientHeight}px`;
  }

  private parsePgn(pgn: string) {
    this.parsedPgn.value = [];
    if (pgn == '')
      return;
    const parts = pgn.split('.');
    let pos = 0;
    parts.forEach(part => {
      if (pos > 0) {
        let moves = part.trim().split(' ', 2);
        this.parsedPgn.value.push(moves);
      }
      pos++;
    });
    console.log(JSON.stringify(this.parsedPgn.value));
  }

  private toDests(): Map<Key, Key[]> {
    const dests = new Map();
    SQUARES.forEach(s => {
      const ms = this.chess.moves({ square: s, verbose: true });
      if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
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
    let fen: string;
    if (customFen) {
      fen = `${$routeParams['fen1']}/${$routeParams['fen2']}/${$routeParams['fen3']}/${$routeParams['fen4']}/${$routeParams['fen5']}/${$routeParams['fen6']}/${$routeParams['fen7']}/${$routeParams['fen8']}`;
      this.target = $routeParams['target'];
      this.seo = fen;
    } else {
      idxCategory = parseInt($routeParams['idxCategory']);
      idxSubcategory = parseInt($routeParams['idxSubcategory']);
      category = categories[idxCategory];
      subcategory = category.subcategories[idxSubcategory];
      idxGame = parseInt($routeParams['idxGame']);
      game = subcategory.games[idxGame];
      idxLastSubcategory = category.count - 1;
      idxLastGame = subcategory.count - 1;
      fen = game.fen;
      this.target = game.target;
      this.seo = `${window.AlpineI18n.t(`category.${category.name}`)} (${subcategory.name}) ${idxGame + 1}/${idxLastGame + 1}`;
    }

    this.chess.load(fen);
    this.parsePgn(this.chess.pgn());

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
      boardTheme: configurationService.configuration.boardTheme,
      pieceTheme: configurationService.configuration.pieceTheme,
      customFen: customFen,
      fen: fen,
      target: this.target,
      idxCategory: idxCategory,
      idxSubcategory: idxSubcategory,
      idxGame: idxGame,
      category: category,
      subcategory: subcategory,
      game: game,
      parsedPgn: self.parsedPgn,
      move: move,
      targetImage: targetImage,
      idxLastSubcategory: idxLastSubcategory,
      idxLastGame: idxLastGame,
      showNavPrev: idxSubcategory > 0 || idxCategory > 0 || idxGame > 0,
      showNavNext: !(idxCategory === endgameDatabase.count - 1 && idxSubcategory === idxLastSubcategory && idxGame === idxLastGame),
      prevUrl: '',
      nextUrl: '',
      listUrl: `/list/${idxCategory}/${idxSubcategory}`,
      ariaDescriptionFromIcon: ariaDescriptionFromIcon,
      chess: this.chess,
      init() {
        self.board = Chessground(document.getElementById('__chessboard__') as HTMLElement, self.boardConfig);
        // resize the board on the next tick, when the DOM of the chessboard has been loaded
        requestAnimationFrame(() => {
          self.resizeBoard();
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
        // prevUrl
        if (idxSubcategory > 0 || idxCategory > 0 || idxGame > 0) {
          let idxCat = this.idxCategory;
          let idxSub = this.idxSubcategory;
          let idxGame = this.idxGame - 1;
          if (idxGame < 0) {
            idxSub--;
            if (idxSub < 0) {
              idxCat--;
              idxSub = categories[idxCat].count - 1;
            }
            idxGame = categories[idxCat].subcategories[idxSub].count - 1;
          }
          this.prevUrl = `/position/${idxCat}/${idxSub}/${idxGame}`;
        }
        // nextUrl
        if (!(idxCategory === endgameDatabase.count - 1 && idxSubcategory === idxLastSubcategory && idxGame === idxLastGame)) {
          let idxCat = this.idxCategory;
          let idxSub = this.idxSubcategory;
          let idxGame = this.idxGame + 1;
          if (idxGame > this.idxLastGame) {
            idxSub++;
            if (idxSub > this.idxLastSubcategory) {
              idxCat++;
              idxSub = 0;
            }
            idxGame = 0;
          }
          this.nextUrl = `/position/${idxCat}/${idxSub}/${idxGame}`;
        }
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
    this.chess.move({
      from: source,
      to: target,
      promotion: promotion
    });
    if (promotion)
      this.board.set({ fen: this.chess.fen() });
    console.log(this.chess.fen());

    this.parsePgn(this.chess.pgn());
    // this.fenHistory.push(this.chess.fen());
    // this.fenPointer++;
    // this.playerMoved.emit();
    // this.initializing = false;
    // this.prepareMove();

    if (!this.checkEnding()) {
      soundService.playAudio('move');
      //this.playerMoved.emit();
      this.getOponentMove();
    }
  }

  private checkEnding(): boolean {
    const result = this.chess.game_over();
    if (result) {
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

  private getOponentMove() {
    let moveFunk;
    if (this.useSyzygy && this.numberOfPieces(this.chess.fen()) <= 7) {
      moveFunk = this.getSyzygyMove;
    } else {
      moveFunk = this.getStockfishMove;
    }
    moveFunk.call(this);
  }

  private getSyzygyMove() {
    syzygyService.get(this.chess.fen())
      .then(response => response.json().then(data => {
        console.log(JSON.stringify(data));
        const bestmove = data.moves[0].uci;
        let match = bestmove.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?/);
        const from = match[1];
        const to = match[2];
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
        this.parsePgn(this.chess.pgn());
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
    this.listeningToStockfish = true;
    stockfishService.postMessage(`go depth ${configurationService.configuration.stockfishDepth} movetime ${configurationService.configuration.stockfishMovetime * 1000}`);
  }

  private stockfishMessage(message: string) {
    if (!this.listeningToStockfish) return;
    //console.log(`STOCKFISH: ${message}`);
    let match;
    if (match = message.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {
      this.listeningToStockfish = false;

      const from = match[1];
      const to = match[2];
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
      this.parsePgn(this.chess.pgn());
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
