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
            this.router.navigate(['/login']);
            break;
          case APP_CONSTANTS.HTTP_STATUS.FORBIDDEN:
          case APP_CONSTANTS.HTTP_STATUS.NOT_FOUND:
          case APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR:
          default:
            // Handle errors silently or with appropriate user feedback
            break;
        }

        return throwError(() => error);
      })
    );
  }
}
