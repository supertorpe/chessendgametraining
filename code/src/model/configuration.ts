import { BOARD_THEMES, PIECE_THEMES, EventEmitter } from '../commons';
import { boardThemeSwitcherService, themeSwitcherService } from '../services';

export type ConfigurationField =

    'useSyzygy' | 'stockfishDepth' | 'stockfishMovetime' | 'automaticShowFirstPosition' | 'preventScreenOff' |
    'colorTheme' | 'playSounds' | 'fullScreen' | 'highlightSquares' | 'pieceTheme' | 'boardTheme' | 'syncGoogleDrive';

export type ConfigurationChangedEvent = { config: Configuration, field: ConfigurationField };

export class Configuration {

    private _configurationChangedEmitter: EventEmitter<ConfigurationChangedEvent> = new EventEmitter<ConfigurationChangedEvent>();

    constructor(
        private _useSyzygy: boolean,
        private _stockfishDepth: number,
        private _stockfishMovetime: number,
        private _automaticShowFirstPosition: boolean,
        private _preventScreenOff: boolean,
        private _colorTheme: string,
        private _playSounds: boolean,
        private _fullScreen: boolean,
        private _highlightSquares: boolean,
        private _pieceTheme: string,
        private _boardTheme: string,
        private _syncGoogleDrive: boolean
    ) { }

    public serialize() {
        return {
            useSyzygy: this._useSyzygy,
            stockfishDepth: this._stockfishDepth,
            stockfishMovetime: this._stockfishMovetime,
            automaticShowFirstPosition: this._automaticShowFirstPosition,
            preventScreenOff: this._preventScreenOff,
            colorTheme: this._colorTheme,
            playSounds: this._playSounds,
            fullScreen: this._fullScreen,
            highlightSquares: this._highlightSquares,
            pieceTheme: this._pieceTheme,
            boardTheme: this._boardTheme,
            syncGoogleDrive: this._syncGoogleDrive
        };
    }

    get configuration(): Configuration { return this; }
    get configurationChangedEmitter(): EventEmitter<ConfigurationChangedEvent> { return this._configurationChangedEmitter; }

    get useSyzygy(): boolean { return this._useSyzygy; }
    set useSyzygy(value: boolean) { this._useSyzygy = value; this._configurationChangedEmitter.notify({ config: this, field: 'useSyzygy' }); }

    get stockfishDepth(): number { return this._stockfishDepth; }
    set stockfishDepth(value: number) { this._stockfishDepth = value; this._configurationChangedEmitter.notify({ config: this, field: 'stockfishDepth' }); }

    get stockfishMovetime(): number { return this._stockfishMovetime; }
    set stockfishMovetime(value: number) { this._stockfishMovetime = value; this._configurationChangedEmitter.notify({ config: this, field: 'stockfishMovetime' }); }

    get automaticShowFirstPosition(): boolean { return this._automaticShowFirstPosition; }
    set automaticShowFirstPosition(value: boolean) { this._automaticShowFirstPosition = value; this._configurationChangedEmitter.notify({ config: this, field: 'automaticShowFirstPosition' }); }

    get preventScreenOff(): boolean { return this._preventScreenOff; }
    set preventScreenOff(value: boolean) { this._preventScreenOff = value; this._configurationChangedEmitter.notify({ config: this, field: 'preventScreenOff' }); }

    get colorTheme(): string { return this._colorTheme; }
    set colorTheme(value: string) { this._colorTheme = value; themeSwitcherService.setTheme(value); this._configurationChangedEmitter.notify({ config: this, field: 'colorTheme' }); }

    get playSounds(): boolean { return this._playSounds; }
    set playSounds(value: boolean) { this._playSounds = value; this._configurationChangedEmitter.notify({ config: this, field: 'playSounds' }); }

    get fullScreen(): boolean { return this._fullScreen; }
    set fullScreen(value: boolean) { this._fullScreen = value; this._configurationChangedEmitter.notify({ config: this, field: 'fullScreen' }); }

    get highlightSquares(): boolean { return this._highlightSquares; }
    set highlightSquares(value: boolean) { this._highlightSquares = value; this._configurationChangedEmitter.notify({ config: this, field: 'highlightSquares' }); }

    get pieceTheme(): string { return this._pieceTheme; }
    set pieceTheme(value: string) { this._pieceTheme = value; this._configurationChangedEmitter.notify({ config: this, field: 'pieceTheme' }); }

    get boardTheme(): string { return this._boardTheme; }
    set boardTheme(value: string) { this._boardTheme = value; boardThemeSwitcherService.setTheme(value); this._configurationChangedEmitter.notify({ config: this, field: 'boardTheme' }); }

    get syncGoogleDrive(): boolean { return this._syncGoogleDrive; }
    set syncGoogleDrive(value: boolean) { this._syncGoogleDrive = value; this._configurationChangedEmitter.notify({ config: this, field: 'syncGoogleDrive' }); }

}

export const DEFAULT_CONFIG = new Configuration(
    true,
    15,
    5,
    true,
    true,
    'dark',
    true,
    true,
    true,
    PIECE_THEMES[0],
    BOARD_THEMES[0].name,
    false
);
