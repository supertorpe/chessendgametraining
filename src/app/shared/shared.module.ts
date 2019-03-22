import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EndgameDatabaseService } from './endgame.database.service';
import { MiscService } from './misc.service';
import { StockfishService } from './stockfish.service';
import { ChunksPipe } from './chunk.pipe';
import { ChessboardComponent } from './chessboard';
import { PromotionDialog } from './chessboard';
import { TranslateModule } from '@ngx-translate/core';

const providers = [EndgameDatabaseService, MiscService, StockfishService];

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
