import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

declare var WebAssembly: any;

@Injectable({
    providedIn: 'root',
})
export class StockfishService {

    private stockfish: any;
    private onMessage: Subject<string>;
    public onMessage$: Observable<string>;

    constructor() {
        const self = this;
        this.onMessage = new Subject<string>();
        this.onMessage$ = this.onMessage.asObservable();
        const wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
        this.stockfish = new Worker(wasmSupported ? '/assets/stockfish/stockfish.wasm.js' : '/assets/stockfish/stockfish.js');
        this.stockfish.addEventListener('message', function(event) {
            self.onMessage.next(event.data);
        });
        this.stockfish.postMessage('uci');
    }

    postMessage(message: string) {
        this.stockfish.postMessage(message);
    }

}
