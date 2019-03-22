import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { PositionPage } from './position.page';

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
  declarations: [PositionPage]
})
export class PositionPageModule {}
