import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { Bike } from './bike';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private version = 1;
  private db;
  public dbPromise;

  constructor(private sqlite: SQLite) {
    this.dbPromise = new Promise((resolve, reject) => {
      document.addEventListener('deviceready', () => {
        console.log('Loading database');
        sqlite.create({
          name: 'data.db',
          location: 'default'
        }).then((db: SQLiteObject) => {

          console.log('Checking DB version');
          db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS version (version INTEGER)');
            // tslint:disable-next-line: no-shadowed-variable
            tx.executeSql('SELECT version FROM version', [], (tx, results) => {
              if (results.rows.length > 0) {
                const oldVersion = results.rows.item(0);
                if (this.version > oldVersion) {
                  this.migrate(oldVersion, this.version);
                  tx.executeSql('UPDATE OR REPLACE version SET version = ?', [this.version]);
                }
              } else {
                tx.executeSql('INSERT INTO version (version) VALUES (?)', [this.version]);
              }
            });
            tx.executeSql('CREATE TABLE IF NOT EXISTS Bikes (' +
              'addr VARCHAR,' +
              'year VARCHAR,' +
              'make VARCHAR,' +
              'model VARCHAR,' +
              'keys VARCHAR,' +
              'keyid VARCHAR,' +
              'limited VARCHAR,' +
              'proximity VARCHAR' +
              ')', []);
            console.log('created bikes table');
          }).then(() => {
            this.db = db;
            resolve(db);
          }).catch(reject);
        });
      });
    });
  }

  loadBikes(): Promise<Bike[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      const bikes = [];
      self.db.transaction((tx) => {
        // tslint:disable-next-line: no-shadowed-variable
        tx.executeSql('SELECT addr,year,make,model,keys,keyid,limited,proximity FROM bikes', [], (tx, results) => {
          for (let i = 0; i < results.rows.length; i++) {
            const row = results.rows.item(i);
            const b = new Bike(row.addr, row.keys, this);
            b.setYear(row.year);
            b.setMake(row.make);
            b.setModel(row.model);
            b.setKeyId(row.keyid);
            b.setLimited(row.limited);
            b.setProximity(row.proximity);
            bikes.push(b);
          }

        }, (err) => {
          console.log('SELECT error', err);
          reject(err);
        });
      }).then(() => {
        resolve(bikes);
      });
    });
  }

  addBike(bike: Bike) {
    return this.db.executeSql('INSERT INTO bikes (addr,year,make,model,keys,keyid,limited,proximity) VALUES (?,?,?,?,?,?,?,?)',
      [
        bike.getAddr(),
        bike.getYear(),
        bike.getMake(),
        bike.getModel(),
        bike.getKeys(),
        bike.getKeyId(),
        bike.getLimited(),
        bike.getProximity()
      ]);
  }

  updateBike(bike: Bike) {
    return this.db.executeSql('UPDATE bikes SET ' +
        'year = ?, make = ?, model = ?, keys = ?, keyid = ?, limited = ?, proximity = ? WHERE addr = ?',
      [
        bike.getYear(),
        bike.getMake(),
        bike.getModel(),
        bike.getKeys(),
        bike.getKeyId(),
        bike.getLimited(),
        bike.getProximity(),
        bike.getAddr()
      ]);
  }

  public migrate(oldV: number, newV: number) {
    if (newV - oldV > 1) {
      this.migrate(oldV, newV - 1);
    }

    switch (newV) {
      case 1:
        break;
      default:
        console.log('UNSUPPORTED DB VERSION');
        break;
    }
  }

  getDB(): SQLiteObject {
    return this.db;
  }

}
