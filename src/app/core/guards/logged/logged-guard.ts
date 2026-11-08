import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

/** Login / register / reset password are only for guests. */
export const loggedGuard: CanActivateFn = () => {
  return inject(CookieService).check('userToken') ? inject(Router).createUrlTree(['/home']) : true;
};
