import {Component, OnInit} from '@angular/core';
import {DeliveryService} from "../shared/services/delivery.service";
import {deliverySystem} from "../shared/data/deliverySystem";

declare var google: any;

const HomeBase = {
  lat: -37.816664,
  lng: 144.963848
};

export interface MarkersList {
  droneId: number;
  lat: number;
  long: number;
  isBusy: boolean;
  packageId?: number;
  packLat?: number;
  packLng?: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  map: any;
  markers: Array<MarkersList> = [];

  constructor(private workingDrones: DeliveryService) { }


  /*
  *   Subscribe to letThemKnow, which let the application know that the data is available
  *   This modulo shape data and display Drones to map
  *   Red dot represents busy Drone
  *   Green dot represents free Drone
  * */
  ngOnInit() {
    this.workingDrones.letThemKnow.subscribe((state: boolean) => {
      deliverySystem.forEach(drone => {
        if (drone.isBusy === true) {
          this.markers.push({
            droneId: drone.droneId,
            lat: drone.location.latitude,
            long: drone.location.longitude,
            isBusy: drone.isBusy,
            packageId: drone.packages[0].packageId,
            packLat: drone.packages[0].destination.latitude,
            packLng: drone.packages[0].destination.longitude
          });
        } else {
          this.markers.push({
            droneId: drone.droneId,
            lat: drone.location.latitude,
            long: drone.location.longitude,
            isBusy: drone.isBusy
          });
        }
      });
      this.initMap();
      console.log('STARTING MAP', this.markers);

    });
  }

  /*
  *   Initialize Google Map Settings
  * */
  initMap() {
    const greenDot = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    const redDot = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    const mp = document.getElementById('map');
    mp.style.backgroundColor = 'green';

    this.map = new google.maps.Map(mp, {
        center: HomeBase,
        zoom: 12
    });

    const marker = new google.maps.Marker({
      position: HomeBase,
      map: this.map,
      title: 'Home Base',
      label: 'Home Base'
    });

    this.markers.forEach(({droneId: id,
                            lat: lat,
                            long: lng,
                            isBusy: isBusy,
                            }) => {

      const mk = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: this.map,
        label: id.toString(),
        icon: isBusy ? redDot : greenDot
      });

      const lines = new google.maps.Polyline({
        path: [{lat: lat, lng: lng}, {lat: HomeBase.lat, lng: HomeBase.lng}],
        strokeColor: '#FF0000',
        strokeOpacity: 0.5,
        strokeWeight: 0.5
      });
      lines.setMap(this.map);
    });
  }
}

