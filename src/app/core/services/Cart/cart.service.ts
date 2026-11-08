import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class CartService {
  private _HttpClient = inject(HttpClient);
  count = signal<number>(0);

  getCount() {
    this.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.count.set(res.numOfCartItems);
      },
    });
  }

  GetLoggedUserCart(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v2/cart`);
  }
  AddProductToCart(p_id: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v2/cart`, { productId: p_id });
  }
  UpdateCartProductQuantity(p_id: string, count: number): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v2/cart/${p_id}`, { count: count });
  }
  RemoveProductFromCart(p_id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v2/cart/${p_id}`);
  }
  ClearUserCart(): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v2/cart`);
  }
  ApplyCouponToCart(cuopon: string): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v2/cart/applyCoupon`, { couponName: cuopon });
  }
}
