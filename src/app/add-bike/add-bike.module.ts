import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddBikePage } from './add-bike.page';
import { DatabaseService } from '../database.service';

const routes: Routes = [
  {
    path: '',
    component: AddBikePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  providers: [ DatabaseService ],
  declarations: [AddBikePage]
})
export class AddBikePageModule {}
