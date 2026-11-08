import { HttpErrorResponse } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, Observable, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { AuthenticationService } from '../Auth/authentication.service';
import { CartService } from '../Cart/cart.service';
import { WishlistService } from '../Wishlist/wishlist.service';

/**
 * Add-to-cart / wishlist actions shared by the product cards, product details and the wishlist page.
 * Handles the "sign in first" redirect, toasts and the per-product loading state.
 */
@Service()
export class ShopActionsService {
  private _AuthenticationService = inject(AuthenticationService);
  private _CartService = inject(CartService);
  private _WishlistService = inject(WishlistService);
  private _ToastrService = inject(ToastrService);
  private _Router = inject(Router);

  cartLoading = signal<string[]>([]);
  wishlistLoading = signal<string[]>([]);

  /** Adds a product to the cart; when `quantity` > 1 the count is then set with the update endpoint. */
  addToCart(p_id: string, quantity = 1): Observable<any> {
    if (!this.requireLogin()) return EMPTY;
    this.cartLoading.update((ids) => [...ids, p_id]);
    return this._CartService.AddProductToCart(p_id).pipe(
      switchMap((res) => {
        if (quantity <= 1) return of(res);
        const item = res.data.products.find((p: any) => (p.product?._id ?? p.product) === p_id);
        return this._CartService.UpdateCartProductQuantity(p_id, (item?.count ?? 1) - 1 + quantity);
      }),
      tap((res) => {
        this._CartService.count.set(res.numOfCartItems);
        this._ToastrService.success('Product added successfully to your cart', 'Added to cart');
      }),
      catchError((err: HttpErrorResponse) => this.fail(err)),
      finalize(() => this.cartLoading.update((ids) => ids.filter((id) => id !== p_id))),
    );
  }

  toggleWishlist(p_id: string): Observable<any> {
    if (!this.requireLogin()) return EMPTY;
    const inWishlist = this._WishlistService.wishlistIds().includes(p_id);
    this.wishlistLoading.update((ids) => [...ids, p_id]);
    const request = inWishlist
      ? this._WishlistService.RemoveProductFromWishlist(p_id)
      : this._WishlistService.AddProductToWishlist(p_id);
    return request.pipe(
      tap((res) => {
        this._WishlistService.wishlistIds.set(res.data);
        if (inWishlist) this._ToastrService.info('Product removed from your wishlist', 'Wishlist');
        else this._ToastrService.success('Product added successfully to your wishlist', 'Wishlist');
      }),
      catchError((err: HttpErrorResponse) => this.fail(err)),
      finalize(() => this.wishlistLoading.update((ids) => ids.filter((id) => id !== p_id))),
    );
  }

  private requireLogin(): boolean {
    if (this._AuthenticationService.isLoggin()) return true;
    this._ToastrService.info('Please sign in first', 'FreshCart');
    this._Router.navigate(['/login'], { queryParams: { returnUrl: this._Router.url } });
    return false;
  }

  private fail(err: HttpErrorResponse) {
    if (err.status !== 401) this._ToastrService.error(err.error?.message || 'Something went wrong', 'Error');
    return EMPTY;
  }
}
