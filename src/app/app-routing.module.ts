import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

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
  { path: 'add-bike', loadChildren: './add-bike/add-bike.module#AddBikePageModule' },
  { path: 'bike/:addr', loadChildren: './bike/bike.module#BikePageModule' },
  { path: 'reg-key/:addr', loadChildren: './reg-key/reg-key.module#RegKeyPageModule' },
  { path: 'manage-keys/:addr', loadChildren: './manage-keys/manage-keys.module#ManageKeysPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
