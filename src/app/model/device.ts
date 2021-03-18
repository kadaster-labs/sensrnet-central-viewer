import { DeviceLocation } from './location';
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
  description: string;

  category: Category;
  connectivity: string;

  location: DeviceLocation;
}

export interface Device extends BaseDevice {
  dataStreams?: Datastream[];
  sensors?: Sensor[];
}

export interface DeviceDTO extends BaseDevice{
  dataStreams?: string;
  sensors?: string;
}
