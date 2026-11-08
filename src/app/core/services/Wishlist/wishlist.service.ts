import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class WishlistService {
  private _HttpClient = inject(HttpClient);

  /** Ids of the products in the logged user's wishlist (used for the hearts and the badge). */
  wishlistIds = signal<string[]>([]);

  getWishlistIds() {
    this.GetLoggedUserWishlist().subscribe({
      next: (res) => this.wishlistIds.set(res.data.map((p: { _id: string }) => p._id)),
    });
  }

  GetLoggedUserWishlist(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/wishlist`);
  }
  AddProductToWishlist(p_id: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/wishlist`, { productId: p_id });
  }
  RemoveProductFromWishlist(p_id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/wishlist/${p_id}`);
  }
}
