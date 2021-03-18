import { Device } from './device';

export enum SensorType {
  NavigationBeacon = 'NavigationBeacon',
  EnvironmentalZoneCameras = 'EnvironmentalZoneCameras',
  SecurityCamera = 'SecurityCamera',
  TraphicFlashlight = 'TraphicFlashlight',
  WeatherStation = 'WeatherStation',
  WindGauge = 'WindGauge',
  WasteContainers = 'WasteContainers',
  FineDustSensor = 'FineDustSensor',
  UVSensor = 'UVSensor',
  LightCell = 'LightCell',
  MotionSensor = 'MotionSensor',
  FireDetector = 'FireDetector',
  WaterLevelMeter = 'WaterLevelMeter',
  MicrophoneOrSoundMeter = 'MicrophoneOrSoundMeter',
  PedometerCounters = 'PedometerCounters',
  RadarDetector = 'RadarDetector',
  GMSSensor = 'GMSSensor',
  DetectionLoop = 'DetectionLoop',
  HeightDetectionDevice = 'HeightDetectionDevice'
}

export interface Sensor {
  _id: string;

  name: string;
  description: string;
  metadata?: any;

  type: SensorType;
  manufacturer: string;
  supplier: string;
  documentation: string;

  device: Device;
}
