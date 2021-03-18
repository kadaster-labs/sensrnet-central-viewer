import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Device } from '../model/device';
import { environment } from '../../environments/environment';
import { LegalEntity } from '../model/legalEntity';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HTTPService {
  constructor(
    private http: HttpClient,
  ) { }

  public getLegalEntities(deviceID: Device['_id']): Observable<LegalEntity[]> {
    const options = {
      params: new HttpParams().set('deviceId', deviceID)
    };

    return this.http.get<LegalEntity[]>(`${environment.apiUrl}/legalentities`, options)
      .pipe(
        catchError(this.handleError<LegalEntity[]>([]))
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
