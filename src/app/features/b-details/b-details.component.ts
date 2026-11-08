import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BrandsService } from '../../core/services/Brands/brands.service';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { IBrand } from '../../core/models/Brand/ibrand.interface';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  imports: [RouterLink, ProductCardComponent],
  selector: 'app-b-details',
  styleUrl: './b-details.component.css',
  templateUrl: './b-details.component.html',
})
export class BDetailsComponent {
  private _BrandsService = inject(BrandsService);
  private _ProductsService = inject(ProductsService);
  private _ActivatedRoute = inject(ActivatedRoute);

  b_id = signal<string>('');
  brand = signal<IBrand>({} as IBrand);
  notFound = signal<boolean>(false);
  products = signal<IProduct[]>([]);
  results = signal<number>(0);
  page = signal<number>(1);
  numberOfPages = signal<number>(1);
  isLoading = signal<boolean>(true);

  pages = computed(() => Array.from({ length: this.numberOfPages() }, (_, i) => i + 1));

  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((route) => {
      this.b_id.set(route.get('id')!);
      this.page.set(1);
      this.getBrand();
      this.getProducts();
    });
  }

  getBrand() {
    this._BrandsService.GetSpecificBrand(this.b_id()).subscribe({
      next: (res) => {
        this.brand.set(res.data);
        this.notFound.set(!res.data);
      },
      error: () => this.notFound.set(true),
    });
  }

  getProducts() {
    this.isLoading.set(true);
    this._ProductsService.GetAllProducts({ brand: this.b_id(), page: this.page(), limit: 12 }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.results.set(res.results);
        this.numberOfPages.set(res.metadata.numberOfPages || 1);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  goToPage(page: number) {
    this.page.set(page);
    this.getProducts();
  }
}
