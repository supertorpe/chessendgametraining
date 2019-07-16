import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ScriptService } from './script.service';

declare var WebAssembly: any;
declare var Stockfish: any;

@Injectable({
    providedIn: 'root',
})
export class StockfishService {

    private stockfish: any;
    private onMessage: Subject<string>;
    public onMessage$: Observable<string>;

    constructor(private scriptService: ScriptService) {
        this.onMessage = new Subject<string>();
        this.onMessage$ = this.onMessage.asObservable();
        if (this.wasmThreadsSupported()) {
            console.log('stockfish.wasm');
            this.initStockfishWasm();
        } else {
            console.log('stockfish.js');
            this.initStockfishJs();
        }
    }

    private wasmThreadsSupported() {
        // WebAssembly 1.0
        var source = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
        if (typeof WebAssembly !== 'object' || !WebAssembly.validate(source)) return false;

        // SharedArrayBuffer
        if (typeof SharedArrayBuffer !== 'function') return false;

        // Atomics
        if (typeof Atomics !== 'object') return false;

        // Shared memory
        var mem = new WebAssembly.Memory({ shared: true, initial: 8, maximum: 16 });
        if (!(mem.buffer instanceof SharedArrayBuffer)) return false;

        // Growable shared memory
        /* try {
          mem.grow(8);
        } catch (e) {
          return false;
        } */

        // Structured cloning
        try {
            // You have to make sure nobody cares about this message!
            window.postMessage(new WebAssembly.Module(source), '*');
        } catch (e) {
            return false;
        }

        return true;
    }

    private initStockfishJs() {
        const self = this;
        const wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
        this.stockfish = new Worker(wasmSupported ? '/assets/stockfish-js/stockfish.wasm.js' : '/assets/stockfish-js/stockfish.js');
        this.stockfish.addEventListener('message', function (event) {
            self.onMessage.next(event.data);
        });
        this.stockfish.postMessage('uci');
    }

    private initStockfishWasm() {
        const self = this;
        this.scriptService.load('stockfish').then(() => {
            self.stockfish = Stockfish();
            self.stockfish.addMessageListener(function (message) {
                self.onMessage.next(message);
            });
            self.stockfish.postMessage('uci');
        });
    }

    postMessage(message: string) {
        this.stockfish.postMessage(message);
    }

}
