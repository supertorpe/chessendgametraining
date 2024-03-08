import { EventEmitter } from '../commons';

declare var WebAssembly: any;

class StockfishService {

    private stockfish: any;
    private _version!: string;
    private _messageEmitter: EventEmitter<string> = new EventEmitter<string>();

    constructor() { }

    get version(): string { return this._version; }
    get messageEmitter(): EventEmitter<string> { return this._messageEmitter; }

    public postMessage(message: string) {
        this.stockfish.postMessage(message);
    }

    private initStockfish(engineUrl: string, nnue: boolean) {
        const self = this;
        this.stockfish = new Worker(engineUrl);
        this.stockfish.addEventListener('message', function (event: MessageEvent<string>) {
            self._messageEmitter.notify(event.data);
        });
        this.stockfish.postMessage('uci');
        if (nnue) this.stockfish.postMessage('setoption name Use NNUE value true');
    }

    private async initStockfishNnue16() {
        this.initStockfish('assets/stockfish/stockfish-nnue-16.js#stockfish-nnue-16.wasm', true);
    }

    private initStockfishNnue16NoSimd() {
        this.initStockfish('assets/stockfish/stockfish-nnue-16-no-simd.js#stockfish-nnue-16-no-simd.wasm', true);
    }

    private initStockfishNnue16Single() {
        this.initStockfish('assets/stockfish/stockfish-nnue-16-single.js#stockfish-nnue-16-single.wasm', true);
    }

    private initStockfishJs() {
        this.initStockfish('assets/stockfish/stockfish.asm.js', false);
    }

    private sharedMemoryTest(): boolean {
        if (typeof Atomics !== 'object') return false;
        if (typeof SharedArrayBuffer !== 'function') return false;
        let mem;
        try {
            mem = new WebAssembly.Memory({ shared: true, initial: 1, maximum: 2 });
            if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

            window.postMessage(mem.buffer, '*');
        } catch (_) {
            return false;
        }
        return mem.buffer instanceof SharedArrayBuffer;
    }

    private detectFeatures(): string[] {
        const result: string[] = [];
        if (typeof WebAssembly === 'object' &&
            typeof WebAssembly.validate === 'function' &&
            WebAssembly.validate(Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]))) {
            result.push('wasm');
            if (this.sharedMemoryTest()) {
                result.push('sharedMem');
                // i32x4.dot_i16x8_s, i32x4.trunc_sat_f64x2_u_zero
                const sourceWithSimd = Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0, 1, 12, 2, 96, 2, 123, 123, 1, 123, 96, 1, 123, 1, 123, 3, 3, 2, 0, 1, 7, 9, 2, 1, 97, 0, 0, 1, 98, 0, 1, 10, 19, 2, 9, 0, 32, 0, 32, 1, 253, 186, 1, 11, 7, 0, 32, 0, 253, 253, 1, 11]); // prettier-ignore
                if (WebAssembly.validate(sourceWithSimd)) result.push('simd');
            }
        }
        return result;
    }

    public init(): Promise<boolean> {
        return new Promise(resolve => {
            const stockfishListener = (message: string) => {
                if (!this._version) this._version = message;
                console.log(message);
                if ('uciok' == message) {
                    //this._messageEmitter.removeEventListener(stockfishListener);
                    resolve(true);
                }
            }
            this._messageEmitter.addEventListener(stockfishListener);
            const features = this.detectFeatures();
            if (features.includes("simd"))
                this.initStockfishNnue16();
            else if (features.includes("sharedMem")) {
                this.initStockfishNnue16NoSimd();
            } else if (features.includes("wasm")) {
                this.initStockfishNnue16Single();
            } else {
                this.initStockfishJs();
            }
        });
    }

}

export const stockfishService = new StockfishService();
