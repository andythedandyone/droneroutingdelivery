
/*
*
*
*           NOT IN USE
*
*
*
* */


import {Injectable, OnInit} from "@angular/core";
import {deliverySystem} from "../data/deliverySystem";
import {Drone} from "../models/drone.model";

export interface Assigns {droneId: number; packageId: number}

@Injectable()
export class DeliverySystemService implements OnInit {

  constructor() {}

  ngOnInit() {
  }
}
