import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxQRCodeModule } from 'ngx-qrcode2';

import { IonicModule } from '@ionic/angular';

import { RegKeyPage } from './reg-key.page';

const routes: Routes = [
  {
    path: '',
    component: RegKeyPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxQRCodeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [RegKeyPage]
})
export class RegKeyPageModule {}
