import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

/** Pages that need a logged user (cart, wishlist, payment, orders, settings). */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(CookieService).check('userToken')) return true;
  inject(ToastrService).info('Please sign in to continue', 'FreshCart');
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
