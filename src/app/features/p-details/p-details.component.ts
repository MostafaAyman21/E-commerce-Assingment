import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { ReviewsService } from '../../core/services/Reviews/reviews.service';
import { ShopActionsService } from '../../core/services/Actions/shop-actions.service';
import { WishlistService } from '../../core/services/Wishlist/wishlist.service';
import { AuthenticationService } from '../../core/services/Auth/authentication.service';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { IReview } from '../../core/models/Review/ireview.interface';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  imports: [CurrencyPipe, DatePipe, CarouselModule, RouterLink, ReactiveFormsModule, ProductCardComponent],
  selector: 'app-p-details',
  styleUrl: './p-details.component.css',
  templateUrl: './p-details.component.html',
})
export class PDetailsComponent {
  private _ProductsService = inject(ProductsService);
  private _ReviewsService = inject(ReviewsService);
  private _ShopActionsService = inject(ShopActionsService);
  private _WishlistService = inject(WishlistService);
  private _ToastrService = inject(ToastrService);
  private _ActivatedRoute = inject(ActivatedRoute);
  protected _AuthenticationService = inject(AuthenticationService);

  p_id = signal<string>('');
  p_details = signal<IProduct>({} as IProduct);
  notFound = signal<boolean>(false);
  mainImage = signal<string>('');
  quantity = signal<number>(1);
  relatedProducts = signal<IProduct[]>([]);
  reviews = signal<IReview[]>([]);
  reviewsShown = signal<number>(5);
  editingReview = signal<string | null>(null);
  savingReview = signal<boolean>(false);

  inWishlist = computed(() => this._WishlistService.wishlistIds().includes(this.p_id()));
  cartLoading = computed(() => this._ShopActionsService.cartLoading().includes(this.p_id()));
  wishlistLoading = computed(() => this._ShopActionsService.wishlistLoading().includes(this.p_id()));
  myReview = computed(() =>
    this.reviews().find((r) => r.user?._id === this._AuthenticationService.userInfo().id),
  );
  /** The user's own review first, then the others, paged by "Show more". */
  visibleReviews = computed(() => {
    const mine = this.myReview();
    const others = this.reviews().filter((r) => r !== mine);
    return (mine ? [mine, ...others] : others).slice(0, this.reviewsShown());
  });

  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    responsive: {
      0: {
        items: 3,
      },
    },
  };

  reviewForm: FormGroup = new FormGroup({
    rating: new FormControl(5, [Validators.required, Validators.min(1)]),
    review: new FormControl(null, [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit() {
    // paramMap emits again when moving to a related product (same component instance).
    this._ActivatedRoute.paramMap.subscribe((route) => {
      if (route.get('id')) {
        this.p_id.set(route.get('id')!);
        this.quantity.set(1);
        this.reviewsShown.set(5);
        this.getProduct();
        this.getReviews();
      }
    });
  }

  getProduct() {
    this._ProductsService.GetSpecificProduct(this.p_id()).subscribe({
      next: (res) => {
        this.p_details.set(res.data);
        this.mainImage.set(res.data.imageCover);
        this.notFound.set(false);
        this.getRelatedProducts(res.data.category._id);
      },
      error: () => this.notFound.set(true),
    });
  }

  getRelatedProducts(categoryId: string) {
    this._ProductsService.GetAllProducts({ category: categoryId, limit: 6 }).subscribe({
      next: (res) =>
        this.relatedProducts.set(res.data.filter((p: IProduct) => p._id !== this.p_id()).slice(0, 5)),
    });
  }

  getReviews() {
    this._ReviewsService.GetAllReviewsForProduct(this.p_id()).subscribe({
      next: (res) => this.reviews.set(res.data),
    });
  }

  changeQuantity(value: number) {
    const max = this.p_details().quantity || 1;
    this.quantity.set(Math.min(Math.max(1, this.quantity() + value), max));
  }

  addToCart() {
    this._ShopActionsService.addToCart(this.p_id(), this.quantity()).subscribe();
  }

  toggleWishlist() {
    this._ShopActionsService.toggleWishlist(this.p_id()).subscribe();
  }

  shareProduct() {
    navigator.clipboard?.writeText(window.location.href).then(
      () => this._ToastrService.success('Product link copied to clipboard', 'Share'),
      () => this._ToastrService.info(window.location.href, 'Product link'),
    );
  }

  startEdit(review: IReview) {
    this.editingReview.set(review._id);
    this.reviewForm.setValue({ rating: review.rating, review: review.review });
  }

  cancelEdit() {
    this.editingReview.set(null);
    this.reviewForm.reset({ rating: 5, review: null });
  }

  submitReview() {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    this.savingReview.set(true);
    const editingId = this.editingReview();
    const request = editingId
      ? this._ReviewsService.UpdateReview(editingId, this.reviewForm.value)
      : this._ReviewsService.CreateReview(this.p_id(), this.reviewForm.value);

    request.subscribe({
      next: () => {
        this.savingReview.set(false);
        this._ToastrService.success(editingId ? 'Your review was updated' : 'Thanks for your review!', 'Review');
        this.cancelEdit();
        this.getReviews();
        this.getProduct();
      },
      error: (err) => {
        this.savingReview.set(false);
        this._ToastrService.error(err.error?.message || err.error?.errors?.msg || 'Could not save your review', 'Review');
      },
    });
  }

  deleteReview(review: IReview) {
    this._ReviewsService.DeleteReview(review._id).subscribe({
      next: () => {
        this._ToastrService.info('Your review was deleted', 'Review');
        if (this.editingReview() === review._id) this.cancelEdit();
        this.reviews.update((list) => list.filter((r) => r._id !== review._id));
        this.getProduct();
      },
      error: (err) => this._ToastrService.error(err.error?.message || 'Could not delete your review', 'Review'),
    });
  }
}
