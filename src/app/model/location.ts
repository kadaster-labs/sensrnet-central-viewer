export interface DeviceLocation {
  type: 'Point';
  /** [latitude, longitude, height] */
  coordinates: [number, number, number];
  baseObjectId: string;
}
