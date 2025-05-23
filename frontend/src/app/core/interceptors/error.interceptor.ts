import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED:
            // Redirect to login on unauthorized
            this.router.navigate(['/login']);
            break;
          case APP_CONSTANTS.HTTP_STATUS.FORBIDDEN:
            // Handle forbidden access
            console.warn('Access forbidden');
            break;
          case APP_CONSTANTS.HTTP_STATUS.NOT_FOUND:
            // Handle not found
            console.warn('Resource not found');
            break;
          case APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR:
            // Handle server error
            console.error('Internal server error');
            break;
          default:
            // Handle other errors
            console.error('An error occurred:', error.message);
        }

        return throwError(() => error);
      })
    );
  }
}
