import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { TranslateModule } from '@ngx-translate/core';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { LazyLoadImagesModule } from 'ngx-lazy-load-images';
import { EndgameDatabaseService } from './endgame.database.service';
import { MiscService } from './misc.service';
import { ConfigurationService } from './configuration.service';
import { StockfishService } from './stockfish.service';
import { ChunksPipe } from './chunk.pipe';
import { ThemeSwitcherService } from './theme-switcher.service';
import { BoardThemeSwitcherService } from './board-theme-switcher.service';
import { ScriptService } from './script.service';
import { NgNoCheck } from './no-check';
import { PreferencesPage } from '../preferences/preferences.page';

const providers = [
    EndgameDatabaseService, MiscService, ConfigurationService, StockfishService, 
    ThemeSwitcherService, BoardThemeSwitcherService, ScriptService, Insomnia, Clipboard];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LazyLoadImagesModule,
        TranslateModule.forChild()
    ],
    declarations: [ChunksPipe,PreferencesPage,NgNoCheck],
    providers: [
        AndroidFullScreen
    ],
    entryComponents: [PreferencesPage],
    exports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LazyLoadImagesModule,
        TranslateModule,
        ChunksPipe,
        NgNoCheck
    ]
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [...providers]
        };
    }
}
