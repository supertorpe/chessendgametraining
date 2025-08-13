// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { BOARD_THEMES, PIECE_THEMES, EventEmitter } from '../commons';
import { boardThemeSwitcherService, themeSwitcherService } from '../services';

export type ConfigurationField =

    'useSyzygy' | 'threeFoldRepetitionCheck' | 'stockfishDepth' | 'stockfishMovetime' | 'automaticShowFirstPosition' | 'automaticShowNextPosition' |
    'solveTrivialPosition' | 'preventScreenOff' | 'colorTheme' | 'playSounds' | 'fullScreen' | 'highlightSquares' | 'pieceTheme' | 'boardTheme' | 'syncGoogleDrive' | 'language';

export type ConfigurationChangedEvent = { config: Configuration, field: ConfigurationField };

export class Configuration {

    private _configurationChangedEmitter: EventEmitter<ConfigurationChangedEvent> = new EventEmitter<ConfigurationChangedEvent>();

    constructor(
        private _useSyzygy: boolean,
        private _threeFoldRepetitionCheck: boolean,
        private _stockfishDepth: number,
        private _stockfishMovetime: number,
        private _automaticShowFirstPosition: boolean,
        private _automaticShowNextPosition: boolean,
        private _solveTrivialPosition: boolean | null,
        private _preventScreenOff: boolean,
        private _colorTheme: string,
        private _playSounds: boolean,
        private _fullScreen: boolean,
        private _highlightSquares: boolean,
        private _pieceTheme: string,
        private _boardTheme: string,
        private _syncGoogleDrive: boolean,
        private _changelog: string,
        private _language: string
    ) { }

    public serialize() {
        return {
            useSyzygy: this._useSyzygy,
            threeFoldRepetitionCheck: this._threeFoldRepetitionCheck,
            stockfishDepth: this._stockfishDepth,
            stockfishMovetime: this._stockfishMovetime,
            automaticShowFirstPosition: this._automaticShowFirstPosition,
            automaticShowNextPosition: this._automaticShowNextPosition,
            solveTrivialPosition: this._solveTrivialPosition,
            preventScreenOff: this._preventScreenOff,
            colorTheme: this._colorTheme,
            playSounds: this._playSounds,
            fullScreen: this._fullScreen,
            highlightSquares: this._highlightSquares,
            pieceTheme: this._pieceTheme,
            boardTheme: this._boardTheme,
            syncGoogleDrive: this._syncGoogleDrive,
            changelog: this._changelog,
            language: this._language
        };
    }

    get configuration(): Configuration { return this; }
    get configurationChangedEmitter(): EventEmitter<ConfigurationChangedEvent> { return this._configurationChangedEmitter; }

    get useSyzygy(): boolean { return this._useSyzygy; }
    set useSyzygy(value: boolean) { this._useSyzygy = value; this._configurationChangedEmitter.notify({ config: this, field: 'useSyzygy' }); }

    get threeFoldRepetitionCheck(): boolean { return this._threeFoldRepetitionCheck; }
    set threeFoldRepetitionCheck(value: boolean) { this._threeFoldRepetitionCheck = value; this._configurationChangedEmitter.notify({ config: this, field: 'threeFoldRepetitionCheck' }); }

    get stockfishDepth(): number { return this._stockfishDepth; }
    set stockfishDepth(value: number) { this._stockfishDepth = value; this._configurationChangedEmitter.notify({ config: this, field: 'stockfishDepth' }); }

    get stockfishMovetime(): number { return this._stockfishMovetime; }
    set stockfishMovetime(value: number) { this._stockfishMovetime = value; this._configurationChangedEmitter.notify({ config: this, field: 'stockfishMovetime' }); }

    get automaticShowFirstPosition(): boolean { return this._automaticShowFirstPosition; }
    set automaticShowFirstPosition(value: boolean) { this._automaticShowFirstPosition = value; this._configurationChangedEmitter.notify({ config: this, field: 'automaticShowFirstPosition' }); }

    get automaticShowNextPosition(): boolean { return this._automaticShowNextPosition; }
    set automaticShowNextPosition(value: boolean) { this._automaticShowNextPosition = value; this._configurationChangedEmitter.notify({ config: this, field: 'automaticShowNextPosition' }); }

    get solveTrivialPosition(): boolean | null { return this._solveTrivialPosition; }
    set solveTrivialPosition(value: boolean | null) { this._solveTrivialPosition = value; this._configurationChangedEmitter.notify({ config: this, field: 'solveTrivialPosition' }); }

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

    get changelog(): string { return this._changelog; }
    set changelog(value: string) { this._changelog = value; }

    get language(): string { return this._language; }
    set language(value: string) { this._language = value; this._configurationChangedEmitter.notify({ config: this, field: 'language' }); }

}

export const DEFAULT_CONFIG = new Configuration(
    true,
    true,
    20,
    10,
    true,
    false,
    null,
    true,
    'dark',
    true,
    true,
    true,
    PIECE_THEMES[0],
    BOARD_THEMES[0].name,
    false,
    '',
    'auto'
);
