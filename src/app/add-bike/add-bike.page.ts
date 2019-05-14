import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { MasterKeyDataService } from '../master-key-data.service';
import { DatabaseService } from '../database.service';
import {IgnitionService} from '../ignition.service';
import {Bike} from '../bike';
import {BikeConnection} from '../bike-connection';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-add-bike',
  templateUrl: './add-bike.page.html',
  styleUrls: ['./add-bike.page.scss'],
})
export class AddBikePage implements OnInit {
  addr: string;
  key: string;
  keyId: string;
  limited: boolean;
  connecting = false;

  constructor(
    private keyData: MasterKeyDataService,
    private db: DatabaseService,
    private ign: IgnitionService,
    private router: Router,
    private app: AppComponent,
    private ngZone: NgZone
  ) {
    this.submit = this.submit.bind(this);
  }

  saveBike(formValues) {
    const newBike = new Bike(this.addr, this.key, this.db);
    newBike.setKeyId(this.keyId);
    newBike.setYear(formValues.year);
    newBike.setMake(formValues.make);
    newBike.setModel(formValues.model);
    newBike.setLimited(this.limited);
    this.ign.addBike(newBike);
    this.ngZone.run(() => this.router.navigateByUrl('/bike/' + this.addr, { replaceUrl : true }));
  }

  submit(form) {
    const values = form.value;
    if (this.keyId === '0') {
      this.connecting = true;
      const conn = this.ign.getBikeConnection(new Bike(this.addr, this.key, this.db));
      conn.registerKeys(values.keyname, 'f').then((args: string[]) => {
        const resp = args[0];
        const keys = args[1];
        this.key = keys;
        this.keyId = resp;
        this.saveBike(values);
        conn.disconnect();
        this.connecting = false;
      }).catch((err) => {
        this.app.showError('Register Keys Error', err);
      });
    } else {
      this.saveBike(values);
    }
  }

  ngOnInit() {
    let keytype = '';
    [this.addr, this.key, this.keyId, keytype] = this.keyData.getData().split('\n');
    if (this.ign.bikes.some((bike) => bike.getAddr() === this.addr)) {
      this.app.showError('Already Configured', 'This bike has already been configured.');
      this.ngZone.run(() => this.router.navigateByUrl('/bike/' + this.addr, { replaceUrl : true }));
    }
    this.limited = !!keytype && keytype.localeCompare('l') === 0;
    if (this.keyId === '') {
      this.keyId = '0';
    }
  }

}
