import { NgZone, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {Command, REG} from '../command';
import { IgnitionService } from '../ignition.service';
import { Bike } from '../bike';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-reg-key',
  templateUrl: './reg-key.page.html',
  styleUrls: ['./reg-key.page.scss'],
})
export class RegKeyPage implements OnInit {
  private bike: Bike;
  private qrstring = '';
  private loading = false;
  private keytype: string;

  constructor(private ign: IgnitionService,
              private ar: ActivatedRoute,
              private ref: ChangeDetectorRef,
              private ngZone: NgZone,
              private app: AppComponent
  ) {
    const addr = ar.snapshot.paramMap.get('addr');
    this.bike = ign.getBike(addr);
    this.register = this.register.bind(this);
  }

  register(keytype, form) {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.ign.getBikeConnection(this.bike).registerKeys(form.value.name, keytype).then((args) => {
      const id = args[0];
      const keys = args[1];
      this.qrstring = [this.bike.getAddr(), keys, id, this.keytype].join('\n');
      this.loading = false;
      const limited = keytype === 'l' ? 1 : 0;
      this.bike.addKeyInfo({id, name: form.value.name, limited, rules: []});
      this.ref.detectChanges();
    }).catch((err) => {
      this.app.showError('Register Keys Error', err);
    });
  }

  ngOnInit() {

  }

}
