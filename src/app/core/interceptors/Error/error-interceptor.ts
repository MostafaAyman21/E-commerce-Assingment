import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from '../../services/Auth/authentication.service';

/** Logs the user out when the API rejects the saved token (expired / invalid). */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const _AuthenticationService = inject(AuthenticationService);
  const _ToastrService = inject(ToastrService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRequest = req.url.includes('/auth/') || req.url.includes('changeMyPassword');
      if (err.status === 401 && _AuthenticationService.isLoggin() && !isAuthRequest) {
        _ToastrService.error('Your session has expired, please sign in again', 'Session expired');
        _AuthenticationService.logOut();
      }
      return throwError(() => err);
    }),
  );
};
