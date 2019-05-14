import { Component } from '@angular/core';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { DatabaseService } from '../database.service';

import { IgnitionService } from '../ignition.service';

import { AppComponent } from '../app.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
    private db: DatabaseService,
    private ign: IgnitionService,
    private app: AppComponent) {
  }

}
