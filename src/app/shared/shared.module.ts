import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { TranslateModule } from '@ngx-translate/core';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import { EndgameDatabaseService } from './endgame.database.service';
import { MiscService } from './misc.service';
import { ConfigurationService } from './configuration.service';
import { StockfishService } from './stockfish.service';
import { ChunksPipe } from './chunk.pipe';
import { ThemeSwitcherService } from './theme-switcher.service';

const providers = [
    EndgameDatabaseService, MiscService, ConfigurationService, StockfishService, 
    ThemeSwitcherService, Insomnia, NativeAudio];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild()
    ],
    declarations: [ChunksPipe],
    providers: [
    ],
    exports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        ChunksPipe
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
