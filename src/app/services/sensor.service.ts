import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { ISensor } from '../model/bodies/sensor-body';
import { SensorTheme } from '../model/bodies/sensorTheme';

export interface ILocationBody {
  longitude: number;
  latitude: number;
  height: number;
  baseObjectId: string;
}

export interface IDatastreamBody {
  name: string;

  reason?: string;
  description?: string;
  observedProperty?: string;
  unitOfMeasurement?: string;
  isPublic?: boolean;
  isOpenData?: boolean;
  isReusable?: boolean;
  documentationUrl?: string;
  dataLink?: string;
  dataFrequency?: number;
  dataQuality?: number;
}

export interface IRegisterSensorBody {
  typeName: string;
  location: ILocationBody;
  dataStreams: IDatastreamBody[];

  name?: string;
  aim?: string;
  description?: string;
  manufacturer?: string;
  active?: boolean;
  observationArea?: object;
  documentationUrl?: string;
  theme?: SensorTheme;
  typeDetails?: object;
}

export interface IUpdateSensorBody {
  name?: string;
  aim?: string;
  description?: string;
  manufacturer?: string;
  observationArea?: object;
  documentationUrl?: string;
  theme?: SensorTheme[];
  typeName?: string;
  typeDetails?: object;
}

export interface ITransferOwnershipBody {
  newOwnerId: string;
}

export interface IShareOwnershipBody {
  ownerIds: string[];
}

@Injectable({ providedIn: 'root' })
export class SensorService {
  constructor(private http: HttpClient) { }

  /** Retrieve sensors */
  public getAll() {
    return this.http.get(`${environment.apiUrl}/Sensor`);
  }

  /** Retrieve a single sensor */
  public get(id: number) {
    return this.http.get(`${environment.apiUrl}/Sensor/${id}`).toPromise();
  }
}
