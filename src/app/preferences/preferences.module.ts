import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PreferencesPage } from './preferences.page';
import { SharedModule } from '../shared';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        component: PreferencesPage
      }
    ])
  ],
  declarations: []
})
export class PreferencesPageModule {}
