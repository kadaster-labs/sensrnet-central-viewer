export interface DeviceLocation {
  type: 'Point';
  /** [longitude, latitude, height] */
  coordinates: [number, number, number];
}
