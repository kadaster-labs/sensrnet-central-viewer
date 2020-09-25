import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(catchError((error) => {
      if (request.url.includes('login') || request.url.includes('refresh')) {
        return throwError(error);
      }

      if (error.status !== 401) {
        return throwError(error);
      }
    }));
  }
}
