import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { BrandsService } from '../../core/services/Brands/brands.service';
import { IProduct, IMetadata } from '../../core/models/Product/iproduct.interface';
import { ICategory } from '../../core/models/Category/icategory.interface';
import { IBrand } from '../../core/models/Brand/ibrand.interface';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { SearchPipe } from '../../shared/pipes/search/search-pipe';

@Component({
  imports: [RouterLink, ProductCardComponent, SearchPipe],
  selector: 'app-shop',
  styleUrl: './shop.component.css',
  templateUrl: './shop.component.html',
})
export class ShopComponent {
  private _ProductsService = inject(ProductsService);
  private _CategoriesService = inject(CategoriesService);
  private _BrandsService = inject(BrandsService);
  private _ActivatedRoute = inject(ActivatedRoute);
  private _Router = inject(Router);

  products = signal<IProduct[]>([]);
  metadata = signal<IMetadata>({} as IMetadata);
  results = signal<number>(0);
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  isLoading = signal<boolean>(true);
  showFilters = signal<boolean>(false);

  // Current filters (from the URL query params)
  keyword = signal<string>('');
  category = signal<string>('');
  brand = signal<string>('');
  sort = signal<string>('');
  page = signal<number>(1);
  minPrice = signal<string>('');
  maxPrice = signal<string>('');

  pages = computed(() => Array.from({ length: this.metadata().numberOfPages || 0 }, (_, i) => i + 1));
  categoryName = computed(() => this.categories().find((c) => c._id === this.category())?.name);
  brandName = computed(() => this.brands().find((b) => b._id === this.brand())?.name);
  hasFilters = computed(() => !!(this.keyword() || this.category() || this.brand() || this.minPrice() || this.maxPrice()));

  sortOptions = [
    { value: '', label: 'Default' },
    { value: '-sold', label: 'Best Selling' },
    { value: '-ratingsAverage', label: 'Top Rated' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-createdAt', label: 'Newest' },
  ];

  ngOnInit() {
    this._CategoriesService.GetAllCategories().subscribe({ next: (res) => this.categories.set(res.data) });
    this._BrandsService.GetAllBrands().subscribe({ next: (res) => this.brands.set(res.data) });

    this._ActivatedRoute.queryParamMap.subscribe((params) => {
      this.keyword.set(params.get('keyword') ?? '');
      this.category.set(params.get('category') ?? '');
      this.brand.set(params.get('brand') ?? '');
      this.sort.set(params.get('sort') ?? '');
      this.page.set(Number(params.get('page')) || 1);
      this.minPrice.set(params.get('minPrice') ?? '');
      this.maxPrice.set(params.get('maxPrice') ?? '');
      this.getProducts();
    });
  }

  getProducts() {
    this.isLoading.set(true);
    // The API has no text search: when searching, load all matches and filter with the search pipe.
    const searching = !!this.keyword();
    this._ProductsService
      .GetAllProducts({
        category: this.category(),
        brand: this.brand(),
        sort: this.sort(),
        minPrice: Number(this.minPrice()) || null,
        maxPrice: Number(this.maxPrice()) || null,
        page: searching ? 1 : this.page(),
        limit: searching ? 100 : 12,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.metadata.set(searching ? ({ numberOfPages: 1 } as IMetadata) : res.metadata);
          this.results.set(res.results);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  setFilter(params: Record<string, string | number | null>) {
    this._Router.navigate(['/shop'], { queryParams: { ...params, page: null }, queryParamsHandling: 'merge' });
  }

  goToPage(page: number) {
    if (page < 1 || page > (this.metadata().numberOfPages || 1)) return;
    this._Router.navigate(['/shop'], { queryParams: { page }, queryParamsHandling: 'merge' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters() {
    this._Router.navigate(['/shop']);
  }
}
