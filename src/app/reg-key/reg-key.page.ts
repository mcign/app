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
