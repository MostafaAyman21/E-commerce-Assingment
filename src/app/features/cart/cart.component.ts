import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../core/services/Cart/cart.service';
import { ICart } from '../../core/models/Cart/icart.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.component.css',
  templateUrl: './cart.component.html',
})
export class CartComponent {
  private _CartService = inject(CartService);
  private _ToastrService = inject(ToastrService);

  CartDetails = signal<ICart>({} as ICart);
  isLoading = signal<boolean>(true);
  loadingItems = signal<string[]>([]);
  confirmClear = signal<boolean>(false);
  couponLoading = signal<boolean>(false);

  ngOnInit() {
    this._CartService.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  isItemLoading(p_id: string) {
    return this.loadingItems().includes(p_id);
  }

  updateCartCount(p_id: string, count: number) {
    if (count < 1) {
      this.removeFromCart(p_id);
      return;
    }
    this.track(p_id);
    this._CartService.UpdateCartProductQuantity(p_id, count).subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this._CartService.count.set(res.numOfCartItems);
        this.untrack(p_id);
      },
      error: (err) => this.fail(p_id, err),
    });
  }

  removeFromCart(p_id: string) {
    this.track(p_id);
    this._CartService.RemoveProductFromCart(p_id).subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this._CartService.count.set(res.numOfCartItems);
        this.untrack(p_id);
        this._ToastrService.success('Product removed from your cart', 'Cart');
      },
      error: (err) => this.fail(p_id, err),
    });
  }

  clearCart() {
    this._CartService.ClearUserCart().subscribe({
      next: (res) => {
        this.CartDetails.set(res);
        this._CartService.count.set(0);
        this.confirmClear.set(false);
        this._ToastrService.info('Your cart is now empty', 'Cart cleared');
      },
      error: (err) => this._ToastrService.error(err.error?.message || 'Could not clear your cart', 'Error'),
    });
  }

  applyCoupon(coupon: string) {
    if (!coupon.trim()) {
      this._ToastrService.info('Please enter a coupon code', 'Coupon');
      return;
    }
    this.couponLoading.set(true);
    this._CartService.ApplyCouponToCart(coupon.trim()).subscribe({
      next: (res) => {
        this.couponLoading.set(false);
        this.CartDetails.set(res);
        this._ToastrService.success('Coupon applied successfully', 'Coupon');
      },
      error: (err) => {
        this.couponLoading.set(false);
        this._ToastrService.error(err.error?.message || 'Invalid coupon', 'Coupon');
      },
    });
  }

  private track(p_id: string) {
    this.loadingItems.update((ids) => [...ids, p_id]);
  }

  private untrack(p_id: string) {
    this.loadingItems.update((ids) => ids.filter((id) => id !== p_id));
  }

  private fail(p_id: string, err: any) {
    this.untrack(p_id);
    this._ToastrService.error(err.error?.message || 'Something went wrong', 'Error');
  }
}
