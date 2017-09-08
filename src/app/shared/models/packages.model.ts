export interface PackageItems {
    isAssigned?: boolean;
    distD?: number;
    timeToD?: number;
    spareTime?: number;
    isAssignable?: boolean;
    destination?: {
      latitude: number;
      longitude: number;
      };
    deadline?: number;
    dateDeadline?: number;
    packageId?: number;
  }

