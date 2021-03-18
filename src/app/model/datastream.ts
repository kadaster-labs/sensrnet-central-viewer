import { ObservationGoal } from './observationGoal';

export enum DatastreamTheme {
  Weather = 'Weather',
  NatureAndEnvironment = 'NatureAndEnvironment',
  Waste = 'Waste',
  Safety = 'Safety',
  Mobility = 'Mobility',
  SoilAndUnderground = 'SoilAndUnderground',
  Other = 'Other'
}

export interface Datastream {
  _id: string;

  name: string;
  description: string;
  unitOfMeasurement: object;
  observedArea: any;
  observationType?: any;
  phenomenonTime?: any;
  resultTime?: any;

  theme: Array<DatastreamTheme>;
  dataQuality: string;
  isActive: boolean;
  isPublic: boolean;
  isOpenData: boolean;
  containsPIData: boolean;
  isReusable: boolean;
  documentation: string;
  dataLink: string;
  dataClassification?: string;

  observationGoals?: Array<ObservationGoal>;
}
