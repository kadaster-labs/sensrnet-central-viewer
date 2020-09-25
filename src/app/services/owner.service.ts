import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Owner } from '../model/owner';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  constructor(private http: HttpClient) { }

  public get(id: number) {
    return this.http.get(`${environment.apiUrl}/Owner/${id}`);
  }
}
