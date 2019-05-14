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


import { OFF } from './command';
import { DatabaseService } from './database.service';

export class Bike {
  // attributes stored in the database
  private addr: string;
  private year: string;
  private make: string;
  private model: string;
  private keys: string;
  private keyId: string;
  private limited: boolean;
  private proximity = 'disabled';

  // not stored in db:
  private color: string;
  private state: string = OFF;
  private lastProx = 'inf';
  private timeOfLastProx: number;
  private keyInfo;
  private region;
  private db: DatabaseService;
  private observer;
  private version: number[];

  constructor(addr: string, keys: string, db: DatabaseService) {
    this.keyId = '0';
    this.addr = addr;
    this.keys = keys;
    this.db = db;
    const uuid = '00683e27-aa51-43b7-b86d-e5888f21b5a9';
    const major = 34987;
    const minorBytes = this.addr.split(':').slice(4).map((hex) => parseInt('0x' + hex, 16));
    const minor = minorBytes[0] * 256 + minorBytes[1];
    this.region = new cordova.plugins["locationManager"].BeaconRegion(this.addr, uuid, major, minor);
  }
  getVersion() {
    return this.version;
  }
  setVersion(version) {
    this.version = version;
  }
  getObserver() {
    return this.observer;
  }
  setObserver(obsv) {
    this.observer = obsv;
  }
  closeObserver() {
    this.observer.complete();
    this.observer = undefined;
  }
  getColor() {
    return this.color;
  }
  setColor(color) {
    this.color = color;
  }
  getState() {
    return this.state;
  }
  setState(state) {
    this.state = state;
  }
  getLastProx() {
    return this.lastProx;
  }
  setLastProx(prox) {
    this.lastProx = prox;
  }
  getTimeOfLastProx() {
    return this.timeOfLastProx;
  }
  setTimeOfLastProx(t) {
    this.timeOfLastProx = t;
  }
  addKeyInfo(keyinfo) {
    this.keyInfo.push(keyinfo);
  }
  setKeyInfo(ki) {
    this.keyInfo = ki;
  }
  getKeyInfo() {
    return this.keyInfo;
  }
  toString(): string {
    return this.year + ' ' + this.make + ' ' + this.model;
  }
  getLink(): string {
    return '/bike/' + this.addr;
  }
  getBeaconRegion() {
    return this.region;
  }
  getAddr() {
    return this.addr;
  }
  setYear(year) {
    this.year = year;
    this.db.updateBike(this);
  }
  getYear() {
    return this.year;
  }
  setMake(make) {
    this.make = make;
    this.db.updateBike(this);
  }
  getMake() {
    return this.make;
  }
  setModel(model) {
    this.model = model;
    this.db.updateBike(this);
  }
  getModel() {
    return this.model;
  }
  setKeys(keys) {
    this.keys = keys;
    this.db.updateBike(this);
  }
  getKeys() {
    return this.keys;
  }
  setKeyId(keyid) {
    this.keyId = keyid;
    this.db.updateBike(this);
  }
  getKeyId() {
    return this.keyId;
  }
  setLimited(limited) {
    this.limited = limited;
    this.db.updateBike(this);
  }
  getLimited() {
    return this.limited;
  }
  setProximity(proximity) {
    console.log('set proximity ', proximity);
    this.proximity = proximity;
    this.db.updateBike(this);
  }
  getProximity() {
    return this.proximity;
  }
}
