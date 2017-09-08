

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import 'rxjs/Rx';

import {WorkingDrone} from '../models/workingDrone.model';
import {PackageItems} from '../models/packages.model';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Drone} from "../models/drone.model";
import {deliverySystem} from "../data/deliverySystem";
import {packagesList} from "../data/packageItems";

const geolib = require('geolib');
import * as moment from 'moment';

const apiD = 'https://codetest.kube.getswift.co/drones';
const apiP = 'https://codetest.kube.getswift.co/packages';

@Injectable()
export class DeliveryService {
  letThemKnow = new BehaviorSubject<boolean>(false);
  alltogetherArr: WorkingDrone[] = [];
  freeDrones: Drone;
  assignments: Array<any> = [];
  unassignedPackageIds: Array<any> = [];
  output: Array<any> = [];

  homeBase = {
    lat: -37.816664,
    lng: 144.963848
  };

  constructor(private http: HttpClient) {}

  /*
  * Fetch Drones from API end point with some drones and packages already assigned
  * Shape Data and add property isBusy, later to check wheter drone is busy or not
  * */
  getDrones(): Observable<any> {
    return this.http.get<WorkingDrone[]>(apiD).map((drones) => {
      drones.forEach((drone) => {
        if (typeof drone.packages[0] !== 'undefined') {
          drone.isBusy = true;
        } else {
          drone.isBusy = false;
        }
      });
      return drones;
    });
  }

  /*
  *  Fetch Packages from API end point and add more data structure for
  *  later calculation and package status
  *  distD: calculate distance from home base to package destination
  *  dateDeadline: for human visualization on package's deadline
  *  timeToD: calculate the time needed traveling at 50kmh to destination in seconds
  *  spareTime: calculate time now to package delivery deadline, it is used later to calculate if drone
  *             has time to return to base and deliver package before deadline.
  *  isAssignable: boolean representing whether the package has enough time be delivered in time based
  *             on distance and deadline.
  * */
  getPacks(): Observable<any> {
    return this.http.get<PackageItems[]>(apiP).map(packs => {
      packs.forEach(pack => {
        const distD = geolib.getDistance(this.homeBase, {
          latitude: pack.destination.latitude,
          longitude: pack.destination.longitude
        }, 1, 1) / 1000;
        // pack.distD = distD.toFixed(2);
        // pack.packages.dateDeadline = moment.unix(parseFloat(pack.packages.deadline)).format('YYYY-MM-DD hh:mm:ss');
        pack.timeToD = ((parseFloat((distD / 50).toPrecision(2)) * 60) * 100);
        pack.spareTime = pack.deadline - Math.floor(Date.now() / 1000); /// the difference btwn deadline and timetoD
        pack.isAssignable = pack.timeToD < pack.spareTime ? true : false;
      });
      return packs;
    });
  }

  /*
  *  Calculates and add more information for Drones that are already assigned.
  *  Adds information such as:
  *  distD: calculate how far a drone is from destination if drone is busy
  *  distB: calculate how far a drone is from home base
  *  totalD: calculate how far a busy drone is from base added destination
  *  totalTtoB: calculate how far in TIME a drone is from home base
  *  And push all new information to new array.
  * */
  splitBusyFreeDrones() {
    deliverySystem.forEach(drone => {
      if (drone.isBusy === true ) {
        const distD = geolib.getDistance({latitude: drone.location.latitude,
            longitude: drone.location.longitude},
          {latitude: drone.packages[0].destination.latitude,
            longitude: drone.packages[0].destination.longitude}, 1, 1) / 1000;

        const distB = geolib.getDistance({latitude: drone.location.latitude,
            longitude: drone.location.longitude},
          this.homeBase, 1, 1) / 1000;

        const totalD = distD + distB;
        const totalTtoB = ((totalD / 50));

        drone.stat = {
          distD: distD,
          distB: distB,
          totalD: totalD,
          totalTtoB: totalTtoB
        };
      } else {
        const distB = geolib.getDistance({latitude: drone.location.latitude,
            longitude: drone.location.longitude},
          this.homeBase, 1, 1) / 1000;
        const totalTtoB = ((distB / 50));
        drone.stat = {
          distB: distB,
          totalD: 0,
          totalTtoB: totalTtoB
        };
      }
      this.alltogetherArr.push(drone);
    });
  }

  /*
  *   This is where most of its final logic happens to assigns drones to expected output
  *   Firstly, it sorts both arrays, Drones and Packages to order by:
  *       Drone: ordered by TIME to home base
  *       Package: ordred by Deadline
  *   Re-assign data to new Ordered arrays to work throught the logic
  *   Here we take packages into account in order to make judgement whether a drone can deliver
  *   the package in time or not
  *   First we check whether package deadline is longer than travel time, otherwise it adds pack to unassign list
  *   Then we proceed to match drones with packages.
  *   Few temp variables have been created to make logic control
  *   droneTtoB: redefine from minutes to seconds how long a drone takes to return to Home Base
  *   droneTB_PTD: calculate the total time a drone takes to arrive to Home base and to deliver the package
  *   result: boolean to whether the drone can accomplish the task within deadline.
  *   fIofDrId, fIoPkId, iIoUsPkId: check if items have already been assigned.
  *   Based on "result" its used a set of if logics to determine if package and drone are a good match
  *   and delivery can be achieved before deadline
  * */
  rearrengeTable() {
    this.splitBusyFreeDrones();

    let drone = this.alltogetherArr.sort((a, b) => {
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxx');
        return a.stat.totalTtoB - b.stat.totalTtoB;
      });
    // this.freeDrones = drone.slice();

    let pack = packagesList.sort(((a, b) => {
      console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyy');
      return a.deadline - b.deadline;
    }));

    pack.forEach(item => {
      if (!item.isAssignable) {
        this.unassignedPackageIds.push(item.packageId);
      } else {
        drone.forEach(dr => {
          const droneTtoB = Number(dr.stat.totalTtoB.toPrecision(2)) * 60 * 100;

          // const droneTtoB = ((parseFloat(dr.stat.totalTtoB).toPrecision(2) * 60) * 100);
          const droneTB_PTD = droneTtoB + item.timeToD;
          const result = droneTB_PTD < item.spareTime ? true : false;

          const fIofDrId = this.assignments.findIndex(id => {
            return id.droneId === dr.droneId;
          });

          const fIoPkId = this.assignments.findIndex(pk => {
            return pk.packageId === item.packageId;
          });

          const iIoUsPkId = this.unassignedPackageIds.findIndex(dI => {
            return dI === item.packageId
          });

          if (result) {
            if(fIofDrId === -1 && fIoPkId === -1) {
              this.assignments.push({droneId: dr.droneId, packageId: item.packageId})
            } else if (iIoUsPkId === -1 && (fIoPkId === -1) && (fIofDrId === -1)) {
              this.unassignedPackageIds.push(item.packageId);
            }
          } else if (iIoUsPkId === -1 && (fIoPkId === -1) && (fIofDrId === -1)) {
            this.unassignedPackageIds.push(item.packageId);
          }
        });
      }
    });

    this.output.push({assignments: this.assignments}, {unassignedPackageIds: this.unassignedPackageIds});
    console.log('Drone by time to base-> ', drone);
    console.log('Package by deadline --> ', pack);
    console.log('EXPECTED OUTPUT ---------------------> ', this.output);
  }
}
