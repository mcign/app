import { Component, OnInit, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { IgnitionService } from '../ignition.service';
import { Bike } from '../bike';
import {Command, UNREG} from '../command';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-manage-keys',
  templateUrl: './manage-keys.page.html',
  styleUrls: ['./manage-keys.page.scss'],
})
export class ManageKeysPage implements OnInit {
  private bike: Bike;
  private connecting = false;

  constructor(
    private ar: ActivatedRoute,
    private alertController: AlertController,
    private ign: IgnitionService,
    private zone: NgZone,
    private app: AppComponent
  ) {
    const addr = ar.snapshot.paramMap.get('addr');
    this.bike = ign.getBike(addr);
  }

  deleteKey(key) {
    if (key.id === this.bike.getKeyId()) {

    }
    this.confirmDelete().then(() => {
      this.zone.run(() => this.connecting = true);
      this.ign.getBikeConnection(this.bike).sendCmd(new Command(UNREG).addArgument(key.id)).then((resp) => {
        this.bike.setKeyInfo(this.bike.getKeyInfo().filter((k) => k !== key));    // remove the deleted key from our list of keys
        this.zone.run(() => this.connecting = false);
      }).catch((err) => {
        this.app.showError('Delete Key Error', err);
        this.zone.run(() => this.connecting = false);
      });
    });
  }

  edit(key, event) {
    console.log(event);
  }

  confirmDelete() {
    return new Promise(async (resolve, reject) => {
      const alert = await this.alertController.create({
        header: 'Alert',
        subHeader: 'Are you sure',
        message: 'This will permanently delete the key from the ignition. Any ' +
        'devices configured to use this key will no longer have access to the ignition',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
            }
          }, {
            text: 'Delete',
            handler: resolve
          }]
      });

      await alert.present();
    });
  }

  ngOnInit() {
  }

}
