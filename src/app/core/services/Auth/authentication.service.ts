import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { ILoggedUser } from '../../models/LoggedUser/ilogged-user.interface';
import { CartService } from '../Cart/cart.service';
import { WishlistService } from '../Wishlist/wishlist.service';

@Service()
export class AuthenticationService {
  private _HttpClient = inject(HttpClient);
  private _CookieService = inject(CookieService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _Router = inject(Router);
  private _PLATFORM_ID = inject(PLATFORM_ID);

  isLoggin = signal<boolean>(false);
  userInfo = signal<ILoggedUser>({} as ILoggedUser);
  userEmail = signal<string>('');

  /** Restores the session from the cookie (browser only — cookies aren't readable during SSR). */
  init() {
    if (!isPlatformBrowser(this._PLATFORM_ID)) return;
    if (this._CookieService.check('userToken')) {
      this.isLoggin.set(true);
      this.decodeToken();
      this.userEmail.set(localStorage.getItem('userEmail') ?? '');
      this.loadUserData();
    }
  }

  decodeToken() {
    if (this._CookieService.get('userToken')) {
      try {
        this.userInfo.set(jwtDecode(this._CookieService.get('userToken')));
      } catch {
        this.logOut();
      }
    }
  }

  /** Saves the token after sign in / sign up / reset / change password. */
  saveToken(token: string, email?: string) {
    this._CookieService.set('userToken', token, { expires: 7, path: '/' });
    if (email) {
      localStorage.setItem('userEmail', email);
      this.userEmail.set(email);
    }
    this.isLoggin.set(true);
    this.decodeToken();
    this.loadUserData();
  }

  /** Cart badge + wishlist hearts for the logged user. */
  loadUserData() {
    this._CartService.getCount();
    this._WishlistService.getWishlistIds();
  }

  logOut() {
    this._CookieService.delete('userToken', '/');
    localStorage.removeItem('userEmail');
    this.isLoggin.set(false);
    this.userInfo.set({} as ILoggedUser);
    this.userEmail.set('');
    this._CartService.count.set(0);
    this._WishlistService.wishlistIds.set([]);
    this._Router.navigate(['/login']);
  }

  SignUp(formData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/signup`, formData);
  }

  SignIn(formData: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/signin`, formData);
  }

  ForgotPassword(email: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/forgotPasswords`, { email });
  }

  VerifyResetCode(resetCode: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/auth/verifyResetCode`, { resetCode });
  }

  ResetPassword(email: string, newPassword: string): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/auth/resetPassword`, { email, newPassword });
  }

  VerifyToken(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/auth/verifyToken`);
  }

  ChangeMyPassword(formData: object): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/users/changeMyPassword`, formData);
  }

  UpdateLoggedUserData(formData: object): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/users/updateMe/`, formData);
  }
}
