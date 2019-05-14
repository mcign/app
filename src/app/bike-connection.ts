import { NgZone } from '@angular/core';
import { BluetoothLE, OperationResult } from '@ionic-native/bluetooth-le/ngx';

import { Bike } from './bike';
import { Command, AUTH, GET, REG, ON, OFF, UPDATE } from './command';

const IGNITION_SERVICE_UUID = '1087fcef-9e46-45f9-865d-c53b07fa17d2';
const DATAOUT_CHAR_UUID = '7cae842a-c471-4bfe-bf34-a749c292e6f1';
const DATAIN_CHAR_UUID = '87c88157-0dd6-4e43-aa63-56035023f9c1';

export interface ConnectionHandler {
  onConnect: () => Promise<any>; // called after connection AND authentication
  onDisconnect: () => Promise<any>;
}

export class BikeConnection {
  private nextCode = 0;
  private authenticated = false;
  private connected = false;
  private connecting = false;
  private handler: ConnectionHandler = undefined;
  private lastDisconnect = 0;
  private pendingCommand = false;   // true when a command has been sent but a response hasn't been recieved
  private commandResponseTimeout: number;
  private resolvePromise: (resp: string) => void = (r: string) => {};
  private rejectPromise: (resp: string) => void = (r: string) => {};

  constructor(public bike: Bike, private ble: BluetoothLE, private zone: NgZone) {
    this.authenticate = this.authenticate.bind(this);
    this.handleResponse = this.handleResponse.bind(this);
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  public setHandler(handler: ConnectionHandler): void {
    this.handler = handler;
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }

  public registerKeys(name: string, keytype: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      cordova.plugins["Crypto"].generateKeys({}, (keystr) => {
        const cmd: Command = new Command(REG);
        cmd.addArgument(keytype);
        cmd.addArgument(keystr);
        cmd.addArgument(name);
        this.sendCmd(cmd).then((resp) => {
          if (resp === 'ERROR') {
            reject('Unknown error on remote device, please try again.');
          } else if (resp === '0') {
            reject('The maximum number of keys has been configured for this device. ' +
              'You must delete an existing key before creating a new one.');
          } else {
            resolve([resp, keystr]);
          }
        }).catch(reject);
      }, reject);
    });
  }

  public getKeyInfo(): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.sendCmd(new Command(GET).addArgument('m')).then((resp) => {
        // retrieve info about each key from the ignition
        const keyInfo = {};
        const getKeyInfo = (keyResp) => {  // recursively get info for each key
          if (keyResp.length > 0) {
            const id = keyResp[0];
            keyResp.shift();
            this.sendCmd(new Command(GET).addArgument('k').addArgument(id)).then((keyInfoResp) => {
              keyInfo[id] = JSON.parse(keyInfoResp);
              console.log(keyInfoResp);
              getKeyInfo(keyResp);
            }).catch(reject);
          } else {    // end of recursion
            this.bike.setKeyInfo([]);
            Object.keys(keyInfo).forEach((id) => {
              keyInfo[id].id = id;
              this.bike.getKeyInfo().push(keyInfo[id]);
            });

            resolve(keyInfo);
          }
        };

        const keys = JSON.parse(resp).registeredKeys;
        keys.shift();
        getKeyInfo(keys);
      }).catch(reject);
    });
  }

  public sendCmd(cmd: Command): Promise<any> {
    return new Promise((resolve, reject) => {
      const send = () => {
        const plaintext: string = '' + this.nextCode + ':' + cmd.toString();

        if (!(this.connected || this.connecting)) {
          console.log('Not sending pending command because device is disconnected.'
            + 'This might be because the onConnect handler caused a disconnection,'
            + 'which isn\'t always an error.', cmd);
          return;
        } else {
          console.log(this.connected);
        }
        console.log('Sending command: ' + plaintext);

        cordova.plugins["Crypto"].encrypt({plaintext, keys: this.bike.getKeys()}, (cipher: string) => {
          this.resolvePromise = resolve;
          this.rejectPromise = reject;
          this.pendingCommand = true;
          this.ble.write({
            address: this.bike.getAddr(),
            service: IGNITION_SERVICE_UUID,
            characteristic: DATAIN_CHAR_UUID,
            value: btoa(this.bike.getKeyId() + ':' + cipher),
          }).then(() => {
            console.log('Wrote command to GATT server');
            if (cmd.getCmd() === UPDATE) {
              resolve();
            } else {
              this.commandResponseTimeout = setTimeout(() => {
                reject('response timeout');
                this.disconnect();
              }, 3000);
            }
          }).catch((err) => {
            reject(['write error: ', err]);
          });
        }, (err) => {
          reject(['CRYPTO ERROR: ', err]);
        });
      };

      if (this.connecting === true) {
        console.log('wait for last connect to finish');
        // TODO: create command queue
        reject('wait for last connect to finish');
      }
      if (this.connected === false) {
        console.log('need to connect before sending command...');
        this.connect().then(() => {
          console.log('CONNECTED!');
          send();
        }).catch(reject);
      } else if (this.authenticated === false && cmd.getCmd() !== AUTH) {
        reject('not authenticated');
      } else if (this.pendingCommand) {
        console.log('wait for last command to finish');
        // TODO: create command queue
        reject('wait for last command to finish');
      } else {
        send();
      }
    }).catch((err) => {
      this.disconnect();
      throw err;
    });
  }

  private handleResponse(resp: OperationResult): void {
    clearTimeout(this.commandResponseTimeout);
    cordova.plugins["Crypto"].decrypt({cipher: atob(resp.value), keys: this.bike.getKeys()}, (decryptResp) => {
      this.pendingCommand = false;

      const parts = decryptResp.split(':');
      this.nextCode = +parts[parts.length - 1];
      if (parts[0] === 'ERROR') {
        this.rejectPromise('Remote device error');
      } else {
        this.resolvePromise(parts.slice(0, parts.length - 1).join(':'));
      }
    }, (err) => {
      this.rejectPromise('Error decrypting response: ' + err);
    });
  }

  // this method subscribes to the DATAOUT characterisic (to recieve command
  // responses) and then authenticates with the remote device
  private authenticate(resp): Promise<string> {
    return new Promise((resolve, reject) => {
      const platformid: string = window.cordova.platformId;
      if (platformid === 'android') {
        this.ble.discover({address: resp.address}).then((discResp) => {
          // TODO: check if device is stuck in DFU mode, upload firmware if so
          if (discResp.status === 'discovered') {
            console.log('got services', discResp);
            this.ble.subscribe({
              address: this.bike.getAddr(),
              service: IGNITION_SERVICE_UUID,
              characteristic: DATAOUT_CHAR_UUID
            }).subscribe((subResp) => {
              if (subResp.status === 'subscribed') {
                console.log('SUBSCRIPTION SUCCESS: ', subResp);
                this.sendCmd(new Command(AUTH)).then((authResp) => {
                  const parts = authResp.split(':');
                  if (parts[0] !== 'OK') {
                    reject('Authentication error');
                  } else {
                    this.authenticated = true;

                    parts.shift();
                    const status = JSON.parse(parts.join(':'));

                    // get current ignition state from response
                    this.zone.run(() => this.bike.setState(status.state === 1 ? ON : OFF));

                    this.bike.setVersion(status.ver);

                    if (!!this.handler) {
                      this.handler.onConnect().then(resolve);
                    } else {
                      resolve();
                    }
                  }
                }).catch(reject);
              } else if (subResp.status === 'subscribedResult') {
                this.handleResponse(subResp);
              }
            }, (err) => {
              reject(err);
            });
          } else {
            console.log('UNEXPECTED RESPONSE');
          }
        }).catch((err) => {
          console.log('CAUGHT ERROR: ', err);
        });
      } else if (platformid === 'ios') {
        // TODO: ios support
      }
    });
  }

  disconnect(): void {
    this.authenticated = false;
    this.connected = false;
    this.connecting = false;
    this.pendingCommand = false;
    this.lastDisconnect = Date.now();

    const close = () => {
      this.ble.close({address: this.bike.getAddr()}).then((resp) => {
        console.log('disconnected and closed object');
      }).catch((err) => {
        console.log('CLOSE ERROR', err);
      });
    };

    if (!!this.handler) {
      this.handler.onDisconnect();
    }

    this.ble.unsubscribe({
      address: this.bike.getAddr(),
      service: IGNITION_SERVICE_UUID,
      characteristic: DATAOUT_CHAR_UUID
    });
    this.ble.disconnect({address: this.bike.getAddr()}).then(close).catch(close);
  }

  connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      const connectCb = (state) => {
        if (state.status === 'connected') {
          this.connected = true;
          this.connecting = false;
          this.authenticate(state).then(resolve).catch(reject);
        } else if (state.status === 'disconnected') {
          this.disconnect();
        } else {
          console.log('ERROR: unexpected response', state);
        }
      };
      const errorCb = (err) => {
        reject(`[${err.error}] ${err.message}`);
        this.disconnect();
      };

      if (this.connecting) {
        reject('already connecting...');
        // TODO: wait for other thread to connect, then resolve
      }
      this.connecting = true;
      console.log('connecting...');
      const timeout = 3000 - (Date.now() - this.lastDisconnect);
      if (timeout > 0) {   // wait at least 3 seconds between disconnecting and reconnecting
        console.log('timeout');
        setTimeout(() => this.ble.connect({address: this.bike.getAddr()}).subscribe(connectCb, errorCb), timeout);
      } else {
        this.ble.connect({address: this.bike.getAddr()}).subscribe(connectCb, errorCb);
      }
    }).catch((err) => {
      this.disconnect();
      throw err;
    });
  }
}
