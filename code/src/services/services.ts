// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import './ionic';
import { storageService } from './storage-service';
import { configurationService } from './configuration-service';
import { endgameDatabaseService } from './endgame-database-service';
import { alpineService } from './alpine-service';
import { themeSwitcherService } from './theme-switcher-service';
import { boardThemeSwitcherService } from './board-theme-switcher-service';
import { syzygyService } from './syzygy-service';
import { stockfishService } from './stockfish-service';
import { soundService } from './sound-service';
import { keyboardShortcutsService } from './keyboard-shortcuts-service';
import { isBot } from '../commons';

export function services_initialize() {
    return storageService.init()
        .then(() => configurationService.init())
        .then(() => isBot() ? true : stockfishService.init())
        .then(() => isBot() ? true : syzygyService.init())
        .then(() => isBot() ? true : soundService.init())
        .then(() => themeSwitcherService.init())
        .then(() => boardThemeSwitcherService.init())
        .then(() => endgameDatabaseService.init())
        .then(() => alpineService.init())
        .then(() => keyboardShortcutsService.init())
        .then(() => keyboardShortcutsService.addCommonShortcuts())
        ;
}
