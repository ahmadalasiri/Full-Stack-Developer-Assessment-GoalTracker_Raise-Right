import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { APP_CONSTANTS } from '../constants/app.constants';
import { LoggerService } from './logger.service';

export interface ApiError {
  message: string;
  status: number;
  timestamp: Date;
  details?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private logger: LoggerService) {}

  handleError(error: HttpErrorResponse | Error): Observable<never> {
    let apiError: ApiError;

    if (error instanceof HttpErrorResponse) {
      // Server-side error
      apiError = {
        message: this.getErrorMessage(error),
        status: error.status,
        timestamp: new Date(),
        details: error.error,
      };

      this.logger.error('HTTP Error:', apiError);
    } else {
      // Client-side error
      apiError = {
        message: error.message || APP_CONSTANTS.MESSAGES.ERROR_GENERIC,
        status: 0,
        timestamp: new Date(),
        details: error,
      };

      this.logger.error('Client Error:', apiError);
    }

    return throwError(() => apiError);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case APP_CONSTANTS.HTTP_STATUS.BAD_REQUEST:
        return error.error?.message || 'Invalid request';
      case APP_CONSTANTS.HTTP_STATUS.UNAUTHORIZED:
        return 'Authentication required';
      case APP_CONSTANTS.HTTP_STATUS.FORBIDDEN:
        return 'Access forbidden';
      case APP_CONSTANTS.HTTP_STATUS.NOT_FOUND:
        return 'Resource not found';
      case APP_CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error occurred';
      case 0:
        return APP_CONSTANTS.MESSAGES.ERROR_NETWORK;
      default:
        return error.error?.message || APP_CONSTANTS.MESSAGES.ERROR_GENERIC;
    }
  }

  getUserFriendlyMessage(error: ApiError): string {
    if (error.status === 0) {
      return APP_CONSTANTS.MESSAGES.ERROR_NETWORK;
    }
    return error.message;
  }
}
