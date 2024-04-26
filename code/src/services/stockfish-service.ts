import { EventEmitter } from '../commons';
import StockfishWeb from 'lila-stockfish-web';

declare var WebAssembly: any;

class StockfishService {

    private stockfish: any;
    private _version!: string;
    private _messageEmitter: EventEmitter<string> = new EventEmitter<string>();
    private avoidNotifications = false;

    constructor() { }

    get version(): string { return this._version; }
    get messageEmitter(): EventEmitter<string> { return this._messageEmitter; }

    public postMessage(message: string) {
        this.stockfish.postMessage(message);
    }

    public onMessage(message: string) {
        if (!this.avoidNotifications) this._messageEmitter.notify(message);
    }

    public warmup(fen: string) {
        this.avoidNotifications = true;
        this.postMessage(`position fen ${fen}`);
        this.postMessage('go infinite');
    }

    public stopWarmup(): Promise<void> {
        return new Promise(resolve => {
            const stockfishListener = (msg: string) => {
                if (msg.startsWith('bestmove')) {
                    this.avoidNotifications = false;
                    this.stockfish.listen = (msg: string) => { this.onMessage(msg); }
                    resolve();
                }
            }
            this.stockfish.listen =  (msg: string) => { stockfishListener(msg); }
            this.postMessage('stop');
        });
    }

    private sharedWasmMemory = (lo: number, hi = 32767): WebAssembly.Memory => {
        let shrink = 4; // 32767 -> 24576 -> 16384 -> 12288 -> 8192 -> 6144 -> etc
        while (true) {
            try {
                return new WebAssembly.Memory({ shared: true, initial: lo, maximum: hi });
            } catch (e) {
                if (hi <= lo || !(e instanceof RangeError)) throw e;
                hi = Math.max(lo, Math.ceil(hi - hi / shrink));
                shrink = shrink === 4 ? 3 : 4;
            }
        }
    };

    private initStockfish() {
        import('lila-stockfish-web/linrock-nnue-7.js').then((makeModule: any) => {
            makeModule
                .default({
                    wasmMemory: this.sharedWasmMemory(1536!),
                    onError: (msg: string) => console.log(msg),
                    locateFile: (name: string) => `assets/stockfish/${name}`,
                })
                .then(async (stockfish: StockfishWeb) => {
                    this.stockfish = stockfish;
                    const response = await fetch(`assets/stockfish/${stockfish.getRecommendedNnue()}`);
                    const buffer = await response.arrayBuffer();
                    const uint8Array = new Uint8Array(buffer);
                    stockfish.setNnueBuffer(uint8Array);
                    stockfish.onError = (msg: string) => { console.log(msg); }
                    stockfish.listen = (msg: string) => { this.onMessage(msg); }
                    stockfish.postMessage('uci');
                });
        });
    }

    public init(): Promise<boolean> {
        return new Promise(resolve => {
            const stockfishListener = (message: string) => {
                if (!this._version) this._version = message;
                if ('uciok' == message) {
                    this._messageEmitter.removeEventListener(stockfishListener);
                    resolve(true);
                }
            }
            this._messageEmitter.addEventListener(stockfishListener);
            this.initStockfish();
        });
    }

}

export const stockfishService = new StockfishService();
