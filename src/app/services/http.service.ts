import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Device } from '../model/device';
import { LegalEntity } from '../model/legalEntity';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ObservationGoal } from '../model/observationGoal';
import { EnvService } from './env.service';

@Injectable({ providedIn: 'root' })
export class HTTPService {
  constructor(
    private env: EnvService,
    private http: HttpClient,
  ) { }

  public getLegalEntities(deviceID: Device['_id']): Observable<LegalEntity[]> {
    const params = new HttpParams()
      .set('deviceId', deviceID)
      .set('allNodes', 'true');
    const options = {
      params,
    };

    return this.http.get<LegalEntity[]>(`${this.env.apiUrl}/legalentities`, options)
      .pipe(
        catchError(this.handleError<LegalEntity[]>([]))
      );
  }

  public getObservationGoals(id: ObservationGoal['_id']): Observable<ObservationGoal> {
    const url = `${this.env.apiUrl}/observationgoal/${id}`;

    return this.http.get<ObservationGoal>(url)
      .pipe(
        catchError(this.handleError<ObservationGoal>(undefined))
      );
  }

  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
