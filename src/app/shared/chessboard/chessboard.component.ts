import { Component, HostListener, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { StockfishService } from '../stockfish.service';
import { Subscription } from 'rxjs';
import { PromotionDialog } from './promotion.dialog';
import * as Chess from 'chess.js';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../audio.service';

declare var ChessBoard: any;
declare var $: any;

@Component({
    selector: 'chessboard',
    templateUrl: 'chessboard.component.html',
    styleUrls: ['chessboard.component.scss'],
})
export class ChessboardComponent implements OnInit, OnDestroy {

    private board: any;
    private chess: Chess = new Chess();
    private originalFen: string;
    private fenHistory: string[];
    private fenPointer: number;
    private target: string;
    private originalPlayer: string;
    private player: string;
    private autosolve = false;
    private initializing = false;
    private syzygyBroken = false;
    private squareSelected;
    private onStockfishMessageSubscription: Subscription;
    public literales: any;

    @Output() engineReady: EventEmitter<void> = new EventEmitter<void>();
    @Output() engineStartThinking: EventEmitter<void> = new EventEmitter<void>();
    @Output() engineEndThinking: EventEmitter<void> = new EventEmitter<void>();
    @Output() engineInfo: EventEmitter<string> = new EventEmitter<string>();
    @Output() playerMoved: EventEmitter<void> = new EventEmitter<void>();
    @Output() gameOver: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private stockfish: StockfishService,
        public translate: TranslateService,
        public modalController: ModalController,
        private http: HttpClient,
        private audio: AudioService) { }

    ngOnInit() {
        this.onStockfishMessageSubscription = this.stockfish.onMessage$.subscribe(event => this.messageReceived(event));
        this.audio.preload('move', '/assets/audio/move.wav');
    }

    ngOnDestroy() {
        this.onStockfishMessageSubscription.unsubscribe();
    }

    @HostListener('window:resize', ['$event']) onResize(event) {
        if (this.board) this.board.resize(event);
    }

    build(fen: string, target) {
        const self = this;
        this.initializing = true;
        this.target = target;
        this.autosolve = false;
        this.originalFen = fen;
        this.fenHistory = [fen];
        if (this.board) {
            this.board.destroy;
        }
        this.board = ChessBoard('__chessboard__', {
            position: fen,
            pieceTheme: '/assets/icon/{piece}.png',
            draggable: true,
            onDragStart: function (source, piece, position, orientation) { return self.onDragStart(source, piece, position, orientation); },
            onDrop: function (source, target, piece, newPos, oldPos, orientation) { return self.onDrop(source, target, piece, newPos, oldPos, orientation); },
            onMoveEnd: function (source, target) { self.onMoveEnd(source, target); },
            onMouseoutSquare: function (square, piece, position, orientation) { self.onMouseoutSquare(square, piece, position, orientation); },
            onMouseoverSquare: function (square, piece, position, orientation) { self.onMouseoverSquare(square, piece, position, orientation); },
            onSnapEnd: function (source, target, piece) { self.onSnapEnd(source, target, piece); }
        });
        this.chess.load(fen);
        this.cleanHighlights();
        this.originalPlayer = this.chess.turn();
        this.player = this.originalPlayer;
        this.initializing = false;
        this.translate.get([
            'chessboard.stalemate',
            'chessboard.insufficent-material',
            'chessboard.three-repetition',
            'chessboard.rule-fifty',
            'chessboard.game-over',
            'chessboard.mate-in',
            'chessboard.unfeasible-mate',
            'chessboard.white-advantage',
            'chessboard.black-advantage',
            'chessboard.querying-syzygy',
            'chessboard.syzygy-error'
        ]).subscribe(async res => {
            this.literales = res;
        });
    }

    rewind() {
        this.cleanHighlights();
        this.board.position(this.originalFen);
        this.chess.load(this.originalFen);
        this.fenHistory = [this.originalFen];
        this.player = this.chess.turn();
    }

    undo() {
        this.cleanHighlights();
        this.chess.undo();
        this.chess.undo();
        this.fenHistory.pop();
        this.fenHistory.pop();
        this.board.position(this.chess.fen());
    }

    history() {
        return this.chess.history();
    }

    solve() {
        this.autosolve = true;
        if (this.player === 'w') {
            this.player = 'b';
        } else {
            this.player = 'w';
        }
        this.prepareMove();
    }

    flip() {
        this.board.flip();
    }

    stop() {
        if (this.autosolve) {
            this.autosolve = false;
        }
        this.stockfish.postMessage('stop');
    }

    winner() {
        if (this.chess.in_checkmate()) {
            return (this.chess.turn() === 'w' ? 'black' : 'white');
        } else {
            return null;
        }
    }

    showFirstPosition() {
        this.fenPointer = 0;
        this.showFenPointer();
    }

    showPreviousPosition() {
        this.fenPointer--;
        this.showFenPointer();
    }

    showNextPosition() {
        this.fenPointer++;
        this.showFenPointer();
    }

    showLatestPosition() {
        this.fenPointer = this.fenHistory.length - 1;
        this.showFenPointer();
    }

    private showFenPointer() {
        this.cleanHighlights();
        this.board.position(this.fenHistory[this.fenPointer], true);
    }

    private messageReceived(message) {
        if (this.initializing) {
            return;
        }
        if ('uciok' === message) {
            this.engineReady.emit();
            return;
        }
        let match;
        if (match = message.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?/)) {
            this.chess.move({ from: match[1], to: match[2], promotion: match[3] });
            this.audio.play('move');
            this.board.position(this.chess.fen(), false);
            this.fenHistory.push(this.chess.fen());
            this.highlightSquares(match[1], match[2]);
            if (this.chess.game_over()) {
                let message;
                if (this.chess.in_checkmate())
                    message = 'Checkmate';
                else if (this.chess.in_stalemate())
                    message = this.literales['chessboard.stalemate'];
                else if (this.chess.insufficient_material())
                    message = this.literales['chessboard.insufficent-material'];
                else if (this.chess.in_threefold_repetition())
                    message = this.literales['chessboard.three-repetition'];
                else if (this.chess.in_draw())
                    message = this.literales['chessboard.rule-fifty'];
                else
                    message = this.literales['chessboard.game-over'];
                this.autosolve = false;
                this.fenPointer = this.fenHistory.length - 1;
                this.gameOver.emit(message);
                return;
            }
            if (this.autosolve || this.player !== this.originalPlayer) {
                if (this.player === 'w') {
                    this.player = 'b';
                } else {
                    this.player = 'w';
                }
                this.prepareMove();
            } else {
                if (this.squareSelected) {
                    document.querySelector('.square-' + this.squareSelected).classList.add('highlight-square');
                }
                this.engineEndThinking.emit();
            }
        } else if (match = message.match(/^info .*\bscore (\w+) (-?\d+)/)) {
            const score = parseInt(match[2]) * (this.chess.turn() == 'w' ? 1 : -1);
            let engineScore;
            /// Is it measuring in centipawns?
            if (match[1] == 'cp') {
                engineScore = (score / 100.0).toFixed(2);
                /// Did it find a mate?
            } else if (match[1] == 'mate') {
                engineScore = this.literales['chessboard.mate-in'] + ' ' + Math.abs(score);
            }
            /// Is the score bounded?
            let bound = '';
            if (match = message.match(/\b(upper|lower)bound\b/)) {
                bound = ((match[1] == 'upper') == (this.chess.turn() == 'w') ? '<= ' : '>= ');
            }
            if ('0.00' === engineScore) {
                this.engineInfo.emit(this.literales['chessboard.unfeasible-mate']);
            } else if (parseFloat(engineScore) > 0) {
                this.engineInfo.emit(this.literales['chessboard.white-advantage'] + ': ' + bound + engineScore);
            } else {
                this.engineInfo.emit(this.literales['chessboard.black-advantage'] + ': ' + bound + engineScore);
            }
        } else if (match = message.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
            this.engineInfo.emit('Depth: ' + match[1] + ' Nps: ' + match[2]);
        }
    }

    private async promoteDialog(): Promise<string> {
        return new Promise<string>(async resolve => {
            const modal = await this.modalController.create({
                component: PromotionDialog,
                componentProps: { turn: this.originalPlayer }
            });
            modal.present();
            const { data } = await modal.onDidDismiss();
            resolve(data.piece);
        });
    }

    private onDragStart(source, piece, position, orientation) {
        const re = this.player == 'w' ? /^b/ : /^w/;
        if (this.chess.game_over() || piece.search(re) !== -1 || this.chess.turn() !== this.player) {
            return false;
        }
        this.drawGreySquares(source);
    };

    private onDrop(source, target, piece, newPos, oldPos, orientation) {
        this.removeGreySquares();
        if (source == target) {
            this.squareSelected = source;
            this.drawGreySquares(source);
            return;
        }
        // validate move
        const move = this.chess.move({
            from: source,
            to: target,
            promotion: 'q'
        });
        if (move === null) return 'snapback';
        this.chess.undo();
        this.squareSelected = target;
        // check promotion
        if (this.chess.get(source).type == 'p' && (target.charAt(1) == '8' || target.charAt(1) == '1')) {
            this.promoteDialog().then(promotion => {
                this.registerMove(source, target, promotion);
                this.board.position(this.chess.fen(), false);
            });
        } else {
            this.registerMove(source, target, 'q');
        }
    };

    private registerMove(source, target, promotion) {
        this.chess.move({
            from: source,
            to: target,
            promotion: promotion
        });
        this.audio.play('move');
        this.fenHistory.push(this.chess.fen());
        this.playerMoved.emit();
        this.prepareMove();
    }

    private onMoveEnd(source, target) {
    };

    private onMouseoutSquare(square, piece, position, orientation) {
        this.removeGreySquares();
    };

    private onMouseoverSquare(square, piece, position, orientation) {
        if (this.chess.turn() !== this.player) {
            return;
        }
        if (this.squareSelected) {
            this.onDrop(this.squareSelected, square, piece, null, null, orientation);
            this.board.position(this.chess.fen(), false);
            this.squareSelected = square;
        } else if (piece) {
            this.drawGreySquares(square);
        }
    };

    private onSnapEnd(source, target, piece) {
        this.highlightSquares(source, target);
    };

    private cleanHighlights() {
        document.querySelectorAll('.highlight-square').forEach(square => {
            square.classList.remove('highlight-square');
        });
    }

    private highlightSquares(source, target) {
        this.cleanHighlights();
        document.querySelector('.square-' + source).classList.add('highlight-square');
        document.querySelector('.square-' + target).classList.add('highlight-square');
    }

    private getStockfishMove() {
        this.stockfish.postMessage('position fen ' + this.chess.fen());
        this.stockfish.postMessage('go depth 28');
    }

    private getSyzygyMove() {
        this.engineInfo.emit(this.literales['chessboard.querying-syzygy']);
        this.http.get<any>(`http://tablebase.lichess.ovh/standard?fen=${this.chess.fen()}`)
            .subscribe(data => {
                const bestmove =
                    data.moves[0].uci
                    //('draw' === this.target ? data.moves[data.moves.length - 1].uci : data.moves[0].uci)
                    ;
                let match = bestmove.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?/);
                this.chess.move({ from: match[1], to: match[2], promotion: match[3] });
                this.board.position(this.chess.fen(), false);
                this.fenHistory.push(this.chess.fen());
                this.highlightSquares(match[1], match[2]);
                if (this.chess.game_over()) {
                    let message;
                    if (this.chess.in_checkmate())
                        message = 'Checkmate';
                    else if (this.chess.in_stalemate())
                        message = this.literales['chessboard.stalemate'];
                    else if (this.chess.insufficient_material())
                        message = this.literales['chessboard.insufficent-material'];
                    else if (this.chess.in_threefold_repetition())
                        message = this.literales['chessboard.three-repetition'];
                    else if (this.chess.in_draw())
                        message = this.literales['chessboard.rule-fifty'];
                    else
                        message = this.literales['chessboard.game-over'];
                    this.autosolve = false;
                    this.fenPointer = this.fenHistory.length - 1;
                    this.gameOver.emit(message);
                    return;
                } else {
                    if (data.dtm) {
                        this.engineInfo.emit(`${this.literales['chessboard.mate-in']} ${Math.abs(data.dtm / 2)}`);
                    } else {
                        this.engineInfo.emit(this.literales['chessboard.unfeasible-mate']);
                    }
                }
                if (this.autosolve || this.player !== this.originalPlayer) {
                    if (this.player === 'w') {
                        this.player = 'b';
                    } else {
                        this.player = 'w';
                    }
                    this.prepareMove();
                } else {
                    if (this.squareSelected) {
                        document.querySelector('.square-' + this.squareSelected).classList.add('highlight-square');
                    }
                    this.engineEndThinking.emit();
                }
            }, error => {
                this.syzygyBroken = true;
                this.engineInfo.emit(this.literales['syzygy-error']);
                this.getStockfishMove();
            }
            );
    }

    private numberOfPieces(fen) {
        return fen.substring(0, fen.indexOf(" ")).replace(/\d/g, "").replace(/\//g, "").length;
    }

    private getEngineMove() {
        if (!this.syzygyBroken && this.numberOfPieces(this.chess.fen()) <= 7) {
            this.getSyzygyMove();
        } else {
            this.getStockfishMove();
        }
    }

    private prepareMove() {
        if (!this.chess.game_over()) {
            if (this.chess.turn() !== this.player) {
                this.getEngineMove();
                this.engineStartThinking.emit();
            }
        } else {
            this.autosolve = false;
            if (this.chess.game_over()) {
                let message;
                if (this.chess.in_checkmate())
                    message = 'Checkmate';
                else if (this.chess.in_stalemate())
                    message = this.literales['chessboard.stalemate'];
                else if (this.chess.insufficient_material())
                    message = this.literales['chessboard.insufficent-material'];
                else if (this.chess.in_threefold_repetition())
                    message = this.literales['chessboard.three-repetition'];
                else if (this.chess.in_draw())
                    message = this.literales['chessboard.rule-fifty'];
                else
                    message = this.literales['chessboard.game-over'];
                this.fenPointer = this.fenHistory.length - 1;
                this.gameOver.emit(message);
                return;
            }
        }
    }

    private drawGreySquares(square) {
        // get list of possible moves for this square
        const moves = this.chess.moves({ square: square, verbose: true });
        // exit if there are no moves available for this square
        if (moves.length === 0) return;
        //this.removeGreySquares();
        // highlight the square they moused over
        this.greySquare(square);
        // highlight the possible squares for this piece
        moves.forEach(move => {
            this.greySquare(move.to);
        });
    }

    private greySquare(square) {
        const squareEl = $('#__chessboard__ .square-' + square);
        let background = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAANElEQVQYlWP4cHPrf0KYgZCCrR3J+BVt7UgmziScimAm4FSEroB067CZgKIIn4IPN7f+BwDVaRVpspCjIQAAAABJRU5ErkJggg==) repeat';
        if (squareEl.hasClass('black-3c85d') === true) {
            background = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAANElEQVQYlWPY2pH8nxBmIKTgw82t+BV9uLmVOJNwKoKZgFMRugLSrcNmAooifAq2diT/BwD7VtmENkc+eQAAAABJRU5ErkJggg==) repeat';
        }
        squareEl.css('background', background);
    };

    private removeGreySquares() {
        $('#__chessboard__ .square-55d63').css('background', '');
    };
}
