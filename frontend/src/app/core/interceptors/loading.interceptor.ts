import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Skip loading for certain requests
  if (req.headers.has('skip-loading')) {
    const newReq = req.clone({
      headers: req.headers.delete('skip-loading'),
    });
    return next(newReq);
  }

  loadingService.show();

  return next(req).pipe(finalize(() => loadingService.hide()));
};
