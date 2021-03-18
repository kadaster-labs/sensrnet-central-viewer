import { DeviceLocation } from './location';
import { Sensor } from './sensor';
import { Datastream } from './datastream';

export enum Category {
  Beacon = 'Beacon',
  Sensor = 'Sensor',
  Camera = 'Camera',
}

export interface Device {
  _id: string;

  name: string;
  description: string;
  properties?: object;

  category: Category;
  connectivity: string;
  networkOperator?: string;
  powerSupply?: string;

  location: DeviceLocation;
  dataStreams?: Array<Datastream>;
  sensors?: Array<Sensor>;
}
