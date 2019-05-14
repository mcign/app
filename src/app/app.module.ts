import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Dialogs } from '@ionic-native/dialogs/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ErrorPopoverComponent } from './error-popover/error-popover.component';

import { NgxQRCodeModule } from 'ngx-qrcode2';
import { Autostart } from '@ionic-native/autostart/ngx';

import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';


@NgModule({
  declarations: [AppComponent, ErrorPopoverComponent],
  entryComponents: [ErrorPopoverComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    NgxQRCodeModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothLE,
    BarcodeScanner,
    Dialogs,
    Autostart,
    SQLite,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
