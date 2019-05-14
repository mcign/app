import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { BluetoothLE, ScanStatus } from '@ionic-native/bluetooth-le/ngx';
import { Autostart } from '@ionic-native/autostart/ngx';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import {IgnitionService} from './ignition.service';
import { DatabaseService } from './database.service';
import { ErrorPopoverComponent } from './error-popover/error-popover.component';
import { PopoverController } from '@ionic/angular';
import { MasterKeyDataService } from './master-key-data.service';

import {Bike} from './bike';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  private addr = '';

  constructor(
    private platform: Platform,
    private barcodeScanner: BarcodeScanner,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private ngZone: NgZone,
    private router: Router,
    public bluetoothle: BluetoothLE,
    private autostart: Autostart,
    private db: DatabaseService,
    private popoverController: PopoverController,
    private mkds: MasterKeyDataService,
    private ign: IgnitionService
  ) {
    this.platform.ready().then((readySource) => {
      this.splashScreen.hide();

      cordova.plugins["autoStart"].enableService('IgnitionService');

      this.bluetoothle.initialize({request: true}).subscribe(ble => {
        console.log(ble)
        this.bluetoothle.hasPermission().then(resp => {
          if (!resp.hasPermission) {
            this.bluetoothle.requestPermission().then(reqResp => {
              if (!reqResp.requestPermission) {
                this.showError('Bluetooth Required', 'Please enable Bluetooth to use this app.');
              }
            });
          }
        });
      });
    });
  }

  scan() {
    this.barcodeScanner.scan(
      {
        preferFrontCamera : false, // iOS and Android
        showFlipCameraButton : false, // iOS and Android
        showTorchButton : true, // iOS and Android
        prompt : 'Place a barcode inside the scan area', // Android
        resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
        formats : 'QR_CODE', // default: all but PDF_417 and RSS_EXPANDED
        orientation : 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
        disableAnimations : true, // iOS
        disableSuccessBeep: false // iOS and Android
      }).then((result) => {
        if (!result.cancelled) {
          this.mkds.setData(result.text);
          this.ngZone.run(() => this.router.navigateByUrl('/add-bike', { replaceUrl : false }));
        }
      }).catch((err) => this.showError('Scanning Error', err));
  }

  unregister(bike: Bike) {
    console.log('unregistering ', bike);
    if (confirm('Would you like to unregister this bike from this phone?')) {
      alert('TODO: delete'); // TODO
    }
  }

  async showError(title: string, message: any) {
    console.log(title, message);

    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }

    const popover = await this.popoverController.create({
      component: ErrorPopoverComponent,
      event: null,
      componentProps: {title, message},
      // backdropDismiss: false,
      translucent: false
    });
    return await popover.present();
  }

  showToast(title, message) {
  }
}
