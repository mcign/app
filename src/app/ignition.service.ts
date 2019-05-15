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


import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';

import { Bike } from './bike';
import { BikeConnection } from './bike-connection';
import { DatabaseService } from './database.service';
import {Command, ON, OFF} from './command';

@Injectable({
  providedIn: 'root'
})
export class IgnitionService {
  connections: { [addr: string]: BikeConnection; } = {};
  public bikes: Bike[] = [];

  constructor(
    private ble: BluetoothLE,
    private platform: Platform,
    private dbsrv: DatabaseService,
    private ngZone: NgZone,
    private router: Router
  ) {

    this.platform.ready().then((readySource) => {
      dbsrv.dbPromise.then(() => {
        dbsrv.loadBikes().then((bikes) => {
          this.bikes = bikes;
          if (this.bikes.length > 0) {
            this.loadBike(this.bikes[0]);
            this.bikes.filter(b => b.getProximity() !== 'disabled').forEach(this.monitorBike);
          }
        });
      });
      this.initIBeacon();
    });
  }

  isDebugMode() {
    return true;
  }

  initIBeacon() {
    // tslint:disable-next-line:no-string-literal
    const delegate = new cordova.plugins['locationManager'].Delegate();

    delegate.didDetermineStateForRegion = (result) => {
      const bike = this.getBike(result.region.identifier);
      if (result.state === 'CLRegionStateInside') {
        console.log('found ignition ', result.region, bike);
        this.startRangingBike(bike);
      } else if (result.state === 'CLRegionStateOutside') {
        console.log('out of range', result, bike);
        // TODO: display notification & alarm if bike wasn't locked before going out of range
        bike.setLastProx('inf');
        bike.setTimeOfLastProx(Date.now());
        this.stopRangingBike(bike);
      }
    };

    delegate.didRangeBeaconsInRegion = (result) => {
      const bike = this.getBike(result.region.identifier);
      bike.setTimeOfLastProx(Date.now());
      if (result.beacons.length === 0) {
        bike.setLastProx('inf');
        return;
      }

      const prox = result.beacons[0].accuracy;
      console.log('got prox', result.beacons[0].accuracy, result.beacons[0].rssi, result.beacons[0].tx, result.beacons[0]);

      bike.setLastProx(prox);
      if (!!bike.getObserver()) {
        bike.getObserver().next(prox);
      }

      if (prox >= +bike.getProximity() && (bike.getState() === OFF)) {
        console.log('prox unlocking bike');
        this.getBikeConnection(bike).sendCmd(new Command(ON)).then(() => {
          bike.setState(ON);
        }).catch((err) => {
          console.log('error turning bike on ' + err);
        });
      } else if (prox < +bike.getProximity() * 1.2 && (bike.getState() === ON)) {
        console.log('prox locking bike');
        this.getBikeConnection(bike).sendCmd(new Command(OFF)).then(() => {
          bike.setState(OFF);
        }).catch((err) => {
          console.log('error turning bike off ' + err);
        });
      }
    };
    // tslint:disable-next-line:no-string-literal
    cordova.plugins['locationManager'].setDelegate(delegate);

    // required in iOS 8+
    // tslint:disable-next-line:no-string-literal
    cordova.plugins['locationManager'].requestAlwaysAuthorization();
  }

  startRangingBike(bike: Bike) {
    // tslint:disable-next-line:no-string-literal
    cordova.plugins['locationManager'].startRangingBeaconsInRegion(bike.getBeaconRegion())
      .fail(console.error) // TODO: handle error
      .done();
  }

  stopRangingBike(bike: Bike) {
    if (!!bike.getObserver()) {
      bike.getObserver().complete();
      bike.setObserver(undefined);
    }
    // tslint:disable-next-line:no-string-literal
    cordova.plugins['locationManager'].stopRangingBeaconsInRegion(bike.getBeaconRegion())
      .fail(console.error)
      .fail(console.error) // TODO: handle error
      .done();
  }

  monitorBike(bike: Bike) {
    // tslint:disable-next-line:no-string-literal
    cordova.plugins['locationManager'].startMonitoringForRegion(bike.getBeaconRegion())
      .fail(console.error) // TODO: handle error
      .done();
  }

  stopMonitorBike(bike: Bike) {
    this.stopRangingBike(bike);
    // tslint:disable-next-line:no-string-literal
    cordova.plugins['locationManager'].stopMonitoringForRegion(bike.getBeaconRegion())
      .fail(console.error) // TODO: handle error
      .done();
  }

  enableProximity(bike: Bike, proximity: string) {
    if (bike.getProximity() === 'disabled') {
      this.monitorBike(bike);
    }
    bike.setProximity(proximity);
  }

  disableProximity(bike: Bike) {
    bike.setProximity('disabled');
    this.stopMonitorBike(bike);
  }

  getProximity(bike: Bike): Observable<string> {
    return new Observable(observer => {
      bike.setObserver(observer);
      this.startRangingBike(bike);
    });
  }

  loadBike(bike: Bike) {
    this.bikes.forEach((b) => {
      b.setColor('');
    });
    bike.setColor('primary');
    this.ngZone.run(() => this.router.navigate(['/bike', bike.getAddr()], { replaceUrl : true }));
  }

  getBikeConnection(bike: Bike): BikeConnection {
    if (!this.connections.hasOwnProperty(bike.getAddr()) || this.connections[bike.getAddr()].bike.getKeyId() === '0') {
      this.connections[bike.getAddr()] = new BikeConnection(bike, this.ble, this.ngZone);
    } else {
      this.connections[bike.getAddr()].bike = bike;
    }
    return this.connections[bike.getAddr()];
  }

  addBike(bike: Bike) {
    if (this.bikes.some((b) => b.getAddr() === bike.getAddr())) {
      console.log('addBike error: Bike already exists');
      return;
    }
    this.bikes.push(bike);
    this.dbsrv.addBike(bike);
  }

  getBike(addr: string): Bike {
    const filtered = this.bikes.filter((bike) => bike.getAddr() === addr);
    if (filtered.length > 0) {
      return filtered[0];
    } else {
      return undefined;
    }
  }

}
