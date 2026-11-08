import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { ShopActionsService } from '../../core/services/Actions/shop-actions.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-wishlist',
  styleUrl: './wishlist.component.css',
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent {
  private _WishlistService = inject(WishlistService);
  protected _ShopActionsService = inject(ShopActionsService);

  products = signal<IProduct[]>([]);
  isLoading = signal<boolean>(true);

  /** Hide products as soon as they are removed (the shared id list updates first). */
  wishlistProducts = computed(() =>
    this.products().filter((p) => this._WishlistService.wishlistIds().includes(p._id)),
  );

  ngOnInit() {
    this._WishlistService.GetLoggedUserWishlist().subscribe({
      next: (res) => {
        this.products.set(res.data);
        this._WishlistService.wishlistIds.set(res.data.map((p: IProduct) => p._id));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  removeFromWishlist(p_id: string) {
    this._ShopActionsService.toggleWishlist(p_id).subscribe();
  }

  /** Add to cart, then remove from the wishlist once that succeeded. */
  moveToCart(p_id: string) {
    this._ShopActionsService.addToCart(p_id).subscribe({ next: () => this.removeFromWishlist(p_id) });
  }
}
