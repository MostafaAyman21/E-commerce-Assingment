import { Component, computed, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProduct } from '../../../core/models/Product/iproduct.interface';
import { ShopActionsService } from '../../../core/services/Actions/shop-actions.service';
import { WishlistService } from '../../../core/services/Wishlist/wishlist.service';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-product-card',
  styleUrl: './product-card.component.css',
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  private _ShopActionsService = inject(ShopActionsService);
  private _WishlistService = inject(WishlistService);

  product = input.required<IProduct>();

  inWishlist = computed(() => this._WishlistService.wishlistIds().includes(this.product()._id));
  cartLoading = computed(() => this._ShopActionsService.cartLoading().includes(this.product()._id));
  wishlistLoading = computed(() =>
    this._ShopActionsService.wishlistLoading().includes(this.product()._id),
  );

  addToCart() {
    this._ShopActionsService.addToCart(this.product()._id).subscribe();
  }

  toggleWishlist() {
    this._ShopActionsService.toggleWishlist(this.product()._id).subscribe();
  }
}
