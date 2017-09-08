import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import { AppComponent } from './app.component';

import {DeliveryService} from './shared/services/delivery.service';
import { MapComponent } from './map/map.component';
import {DeliverySystemService} from "./shared/services/deliverySystem.service";
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SidebarComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [DeliveryService, DeliverySystemService],
  bootstrap: [AppComponent]
})
export class AppModule { }
