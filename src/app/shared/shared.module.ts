import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { EndgameDatabaseService } from './endgame.database.service';
import { MiscService } from './misc.service';
import { StockfishService } from './stockfish.service';
import { ChunksPipe } from './chunk.pipe';
import { ChessboardComponent } from './chessboard';
import { PromotionDialog } from './chessboard';
import { AudioService } from './audio.service';

const providers = [EndgameDatabaseService, MiscService, StockfishService, NativeAudio, AudioService];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule.forChild()
    ],
    declarations: [
        ChunksPipe,
        ChessboardComponent,
        PromotionDialog
    ],
    providers: [
    ],
    entryComponents: [PromotionDialog],
    exports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TranslateModule,
        ChunksPipe,
        ChessboardComponent,
        PromotionDialog
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
