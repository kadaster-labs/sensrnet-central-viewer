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
  location: DeviceLocation;
}

// Device as returned by MapServer. It stringifies the nested objects.
export interface DeviceDTO extends BaseDevice {
  _json: {
    datastreams?: Datastream[];
    sensors?: Sensor[];
    location: DeviceLocation;
  }
}
