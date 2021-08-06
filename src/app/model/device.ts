import { DeviceLocation } from './deviceLocation';
import { Sensor } from './sensor';
import { Datastream } from './datastream';

export enum Category {
  Beacon = 'Beacon',
  Sensor = 'Sensor',
  Camera = 'Camera',
}

interface BaseDevice {
  _id: string;

  name: string;
  description?: string;

  category: Category;
  connectivity?: string;
}

export interface Device extends BaseDevice {
  datastreams?: Datastream[];
  sensors?: Sensor[];
  location_object: DeviceLocation;
}

// Device as returned by GeoServer. It stringifies the nested objects.
export interface DeviceDTO extends BaseDevice {
  datastreams?: string;
  sensors?: string;
  location_object: string;
}
