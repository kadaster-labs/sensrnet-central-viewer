import { Device } from './device';

export interface Sensor {
  _id: string;

  name: string;
  description: string;

  type: string;
  manufacturer?: string;
  supplier?: string;
  documentation?: string;

  device?: Device;
}
