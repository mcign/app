import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { Observable } from 'rxjs/Observable';

import {IgnitionService} from './ignition.service';
import {Command, UPDATE} from './command';

export const FW_VERSION_MAJOR = 0;
export const FW_VERSION_MINOR = 2;

@Injectable({
  providedIn: 'root'
})

export class FirmwareUpdateService {
  private OTA_SERVICE = '1D14D6EE-FD63-4FA1-BFA4-8F47B42119F0';
  private OTA_CTRL_ATTRIBUTE = 'F7BF3564-FB6D-4E53-88A4-5E37E0326063';
  private OTA_DATA_ATTRIBUTE = '984227F3-34FC-4045-A5D0-2C581F81A153';
  private resolve;
  private reject;

  constructor(
    private ble: BluetoothLE,
    private http: HttpClient,
    private ign: IgnitionService
  ) {
  }

  canUpdate(bike): boolean {
    const version = bike.getVersion();
    if (FW_VERSION_MAJOR > version[0]) {
      return true;
    }
    if (FW_VERSION_MINOR > version[1] && FW_VERSION_MAJOR >= version[0]) {
      return true;
    }

    return false;
  }

  uploadGBL(file, bike, observer) {
    let uploadSuccess = false;
    // TODO: set up connection timeout
    return new Promise((resolve, reject) => {
      this.ble.connect({address: bike.getAddr()}).subscribe(
        (state) => {
          if (state.status === 'connected') {
            console.log('connected to OTA DFU mode');
            const platformid: string = window.cordova.platformId;
            if (platformid === 'android') {
              let promise = this.ble.discover({address: state.address}).then((resp) => {
                if (resp.status !== 'discovered') {
                  throw ['UNEXPECTED RESPONSE', resp];
                }
                return this.ble.write({
                  address: resp.address,
                  service: this.OTA_SERVICE,
                  characteristic: this.OTA_CTRL_ATTRIBUTE,
                  value: this.ble.bytesToEncodedString(new Uint8Array([0]))  // starts OTA write procedure
                });
              });

              const bufSize = 255;
              for (let i = 0; i < file.byteLength; i += bufSize) {
                promise = promise.then((resp) => {
                  console.log('wrote ' + i + ' bytes');
                  observer.next(i / file.byteLength);
                  return this.ble.write({
                    address: state.address,
                    service: this.OTA_SERVICE,
                    characteristic: this.OTA_DATA_ATTRIBUTE,
                    type: 'noResponse',
                    value: this.ble.bytesToEncodedString(new Uint8Array(file.slice(i, i + bufSize)))
                  }).catch((err) => {
                    console.log('write error', err);
                    throw err;
                  });
                });
              }

              promise.then((resp) => {
                observer.next(100);
                console.log('uploaded gbl file');
                return this.ble.write({
                  address: state.address,
                  service: this.OTA_SERVICE,
                  characteristic: this.OTA_CTRL_ATTRIBUTE,
                  value: this.ble.bytesToEncodedString(new Uint8Array([3])) // ends OTA write procedure
                }).catch((err) => {
                  console.log('final write error', err);
                  throw new Error('Error uploading file to device: ' + err.status.toString(16));
                });
              }).then((resp) => {
                console.log('finished uploading, got response:', resp);
                return this.ble.close({address: bike.getAddr()});
              }).then((resp) => {
                resolve();
                uploadSuccess = true;
                // TODO
              }).catch(reject);

            } else if (platformid === 'ios') {
              // TODO: ios support
            }
          } else if (state.status === 'disconnected') {
            if (uploadSuccess) {
              // resolve()
            } else {
              reject();
            }
          } else {
            reject(['unexpected connection state', state.status]);
 }
        },
        (err) => {
          console.log('Error connecting to device', err);
          reject(err);
        }
              );
    });
  }

  updateBike(bike) {
    const conn = this.ign.getBikeConnection(bike);

    return new Observable(observer => {
      conn.sendCmd(new Command(UPDATE))
        .then(conn.disconnect)
        .then(() => {
          observer.next(-1);
          // give the remote device time to reboot into DFU mode
          return new Promise(resolve => setTimeout(resolve, 1000));
        })
        .then(() => {
          return new Promise((resolve, reject) => {
            this.http.get('/assets/apploader.gbl', {responseType: 'arraybuffer'}).subscribe((apploader) => {
              this.http.get('/assets/application.gbl', {responseType: 'arraybuffer'}).subscribe((application) => {
                this.uploadGBL(apploader, bike, observer).then(() => {
                  console.log('uploaded apploader');
                  observer.next(-1);
                  return this.uploadGBL(application, bike, observer);
                }).catch(observer.error);
              });
            });
          }).catch((err) => {
            console.log('firmware error', err);
            observer.error(err);
          }).finally(() => {
            observer.complete();
          });
        });
    });
  }
}

