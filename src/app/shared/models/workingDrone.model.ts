export interface WorkingDrone {
  droneId: number;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  packages?: {
    destination?: {
      latitude?: number;
      longitude?: number;
    };
    deadline?: number;
    packageId?: number;
  };
  isBusy: boolean;
  stat?: {
    distB?: number;
    distD?: number;
    totalD?: number;
    totalTtoB?: number;
  };
}
