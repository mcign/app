/*
    Copyright 2018,2019 Austin Haigh

    This file is part of MCIGN.

    MCIGN is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    MCIGN is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with MCIGN.  If not, see <https://www.gnu.org/licenses/>.

*/


import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { Dialogs } from '@ionic-native/dialogs/ngx';

import { IgnitionService } from '../ignition.service';
import { Bike } from '../bike';
import { BikeConnection, ConnectionHandler } from '../bike-connection';
import {Command, ON, OFF, REG, GET} from '../command';
import { AppComponent } from '../app.component';
import { FirmwareUpdateService } from '../firmware-update.service';

@Component({
  selector: 'app-bike',
  templateUrl: './bike.page.html',
  styleUrls: ['./bike.page.scss'],
})
export class BikePage implements ConnectionHandler {
  private bike: Bike;
  private color = 'red';
  private connecting = false;
  private conn: BikeConnection;
  private progress = -1;
  private prox = '';

  constructor(
    private ar: ActivatedRoute,
    private ign: IgnitionService,
    private zone: NgZone,
    private dialogs: Dialogs,
    private router: Router,
    private app: AppComponent,
    private update: FirmwareUpdateService
  ) {
    const addr = ar.snapshot.paramMap.get('addr');
    this.bike = ign.getBike(addr);
    console.log(this.bike);
    this.conn = this.ign.getBikeConnection(this.bike);
    this.conn.setHandler(this);
    if (this.conn.isAuthenticated()) {
      this.color = 'green';
    }

    //this.ign.getProximity(this.bike).subscribe((prox) => zone.run(() => this.prox = prox));
  }

  async onDisconnect(): Promise<any> {
    this.zone.run(() => {
      this.color = 'red';
      this.connecting = false;
    });
  }

  async onConnect(): Promise<any> {
    this.zone.run(() => {
      this.color = 'green';
      this.connecting = false;
    });

    if (this.update.canUpdate(this.bike) &&
      confirm('Would you like to update the device firmware?')) {
      return new Promise((resolve, reject) => {
        const subscription = this.update.updateBike(this.bike).subscribe((progress: number) => {
          this.zone.run(() => {
            if (progress < 0) {
              this.connecting = true;
            } else {
              this.connecting = false;
              this.progress = progress;
            }
          });
        }, (err) => {
          this.app.showError('Update Error', err.message + ': ' + err.status.toString(16));
          reject(err);
        }, () => {
          this.zone.run(() => {
            this.progress = -1;
            this.connecting = false;
          });
          resolve();
        });
      });
    } else {
      return new Promise((resolve) => resolve());
    }
  }

  manageKeys() {
    this.connecting = true;
    this.conn.getKeyInfo().then((keyInfo) => {
      this.connecting = false;
      this.router.navigate(['/manage-keys', this.bike.getAddr()]);
    }).catch(err => this.app.showError('Connection Error', err));

  }

  toggle() {
    if (this.color !== 'green') {
      this.color = 'orange';
      this.connecting = true;
    }
    // disable proximity since the bike was manually switched on/off
    // prox will be automatically re-enabled when we are out of range
    this.ign.stopRangingBike(this.bike);
    this.conn.sendCmd(new Command(this.bike.getState() === OFF ? ON : OFF)).then((resp) => {
      console.log('got resp', resp);
      this.zone.run(() => {
        this.bike.setState(this.bike.getState() === ON ? OFF : ON);
        console.log('turned switch ' + this.bike.getState());
      });
    }).catch((err) => {
      this.app.showError('Connection Error', err);
    });
  }

  configProximity() {
    let gotProx = false;
    this.connecting = true;
    // TODO: timeout
    this.ign.getProximity(this.bike).subscribe((prox) => {
      this.connecting = false;
      if (!gotProx) {
        gotProx = true;


        this.dialogs.confirm(
          'Configure proximity',  // message
          'Proximity',            // title
          ['Disable', 'Set Threshold', 'Cancel']             // buttonLabels
        ).then((button: number) => {
          switch (button) {
            case 1: // disable
              this.ign.disableProximity(this.bike);
              break;
            case 2: // set threshold
              if (Date.now() - this.bike.getTimeOfLastProx() > 2000) {
                this.app.showError('Proximity Error', 'No recent proximity readings available, please try again.');
              } else if (this.bike.getLastProx() === 'inf') {
                this.app.showError('Proximity Error', 'Bike not found, make sure you are within rage.');
              } else {
                this.ign.enableProximity(this.bike, this.bike.getLastProx());
              }
              break;
            case 3: // cancel
              break;
            default:
              console.log('UNEXPECTED BUTTON', button);
              break;
          }
          if (this.bike.getProximity() === 'disabled') {
            this.ign.stopMonitorBike(this.bike);
          }
        }).catch((err) => {
          this.app.showError('Proximity Error', err);
        });
      }
    });
  }

}
