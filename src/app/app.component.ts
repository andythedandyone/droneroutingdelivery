import {Component, OnInit} from '@angular/core';

import {DeliveryService} from './shared/services/delivery.service';
import {WorkingDrone} from './shared/models/workingDrone.model';
import {PackageItems} from './shared/models/packages.model';
import {deliverySystem} from './shared/data/deliverySystem';
import {packagesList} from './shared/data/packageItems';
import {DeliverySystemService} from "./shared/services/deliverySystem.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  drones: WorkingDrone[];
  packageItems: PackageItems[];
  // isCallingAPI: true;

  tableGate = {
    allDrones: false,
    allPacks: false,
    assPack: false,
    unAssPack: false
  }

  constructor(private delivery: DeliveryService, private system: DeliverySystemService) {}

  /*
  * Initialize APP calling APIS and setting up data
  * */
  ngOnInit() {
      console.log('it started');
      this.delivery.getDrones().subscribe(drones => {
        drones.forEach(drone => {
          deliverySystem.push(drone);
        });
        this.delivery.letThemKnow.next(true);
      });

      this.delivery.getPacks().subscribe(packs => {
        packs.forEach(pack => {
          packagesList.push(pack);
        });
      });
      this.delivery.splitBusyFreeDrones();
  }

  /*
  *   Buttons for table and calculate output below viewport
  * */
  gateKeeper(state: string) {
     if (this.tableGate.hasOwnProperty(state)) {
       this.tableGate = {
         allDrones: false,
         allPacks: false,
         assPack: false,
         unAssPack: false
       };
       this.tableGate[state] = !this.tableGate[state];
     }
  }


  /*
  *   Display table with Drones and packages already assigned fetched
  * */
  getAlldronesAvail() {
    this.gateKeeper('allDrones');
    this.drones = deliverySystem;
  }

  /*
  *   Display table with all Packages fetched
  * */
  getAllPackages() {
    this.gateKeeper('allPacks');
    this.packageItems = packagesList;
  }

  /*
  *   Call logic to calculate expected Output
  * */
  rearrengeTable() {
    this.delivery.rearrengeTable();
  }
}
