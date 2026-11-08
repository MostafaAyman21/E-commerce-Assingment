import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class OrdersService {
  private _HttpClient = inject(HttpClient);

  CreateCashOrderFromCart(cartId: string, data: object): Observable<any> {
    // v1 charges exactly the cart total (v2 adds tax/shipping the cart page doesn't show).
    return this._HttpClient.post(`${environment.baseURL}/api/v1/orders/${cartId}`, { shippingAddress: data });
  }
  /** Stripe redirects back to `<url>/allorders` after a successful payment. */
  CheckoutSession(cartId: string, data: object): Observable<any> {
    return this._HttpClient.post(
      `${environment.baseURL}/api/v1/orders/checkout-session/${cartId}?url=${window.location.origin}`,
      { shippingAddress: data },
    );
  }
  GetUserOrders(userId: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/orders/user/${userId}`);
  }
}
