import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'preferences',
    loadChildren: './preferences/preferences.module#PreferencesPageModule'
  },
  {
    path: 'about',
    loadChildren: './about/about.module#AboutPageModule'
  },
  {
    path: 'list/:idxcategory/:idxsubcategory',
    loadChildren: './list/list.module#ListPageModule'
  },
  {
    path: 'position/:idxcategory/:idxsubcategory/:idxposition',
    loadChildren: './position/position.module#PositionPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
