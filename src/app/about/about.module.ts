import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared';
import { AboutPage } from './about.page';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: AboutPage
      }
    ])
  ],
  declarations: [AboutPage]
})
export class AboutPageModule {}
