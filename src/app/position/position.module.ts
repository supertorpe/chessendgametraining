import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { PositionPage } from './position.page';
import { ChessboardComponent } from '../chessboard';
import { PromotionDialog } from '../chessboard';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: PositionPage
      }
    ])
  ],
  declarations: [PositionPage,ChessboardComponent,PromotionDialog],
  entryComponents: [PromotionDialog]
})
export class PositionPageModule {}
