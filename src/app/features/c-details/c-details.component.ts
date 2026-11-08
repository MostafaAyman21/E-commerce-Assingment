import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { ProductsService } from '../../core/services/Porducts/products.service';
import { ICategory, ISubCategory } from '../../core/models/Category/icategory.interface';
import { IProduct } from '../../core/models/Product/iproduct.interface';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  imports: [RouterLink, ProductCardComponent],
  selector: 'app-c-details',
  styleUrl: './c-details.component.css',
  templateUrl: './c-details.component.html',
})
export class CDetailsComponent {
  private _CategoriesService = inject(CategoriesService);
  private _ProductsService = inject(ProductsService);
  private _ActivatedRoute = inject(ActivatedRoute);

  c_id = signal<string>('');
  category = signal<ICategory>({} as ICategory);
  notFound = signal<boolean>(false);
  subCategories = signal<ISubCategory[]>([]);
  selectedSub = signal<ISubCategory | null>(null);
  products = signal<IProduct[]>([]);
  results = signal<number>(0);
  page = signal<number>(1);
  numberOfPages = signal<number>(1);
  isLoading = signal<boolean>(true);

  pages = computed(() => Array.from({ length: this.numberOfPages() }, (_, i) => i + 1));

  ngOnInit() {
    this._ActivatedRoute.paramMap.subscribe((route) => {
      this.c_id.set(route.get('id')!);
      this.selectedSub.set(null);
      this.page.set(1);
      this.getCategory();
      this.getSubCategories();
      this.getProducts();
    });
  }

  getCategory() {
    this._CategoriesService.GetSpecificCategory(this.c_id()).subscribe({
      next: (res) => {
        this.category.set(res.data);
        this.notFound.set(!res.data);
      },
      error: () => this.notFound.set(true),
    });
  }

  getSubCategories() {
    this._CategoriesService.GetAllSubCategoriesOnCategory(this.c_id()).subscribe({
      next: (res) => this.subCategories.set(res.data),
    });
  }

  /** Loads the subcategory by id, then filters the products with it. */
  selectSub(sub_id: string | null) {
    this.page.set(1);
    if (!sub_id) {
      this.selectedSub.set(null);
      this.getProducts();
      return;
    }
    this._CategoriesService.GetSpecificSubCategory(sub_id).subscribe({
      next: (res) => {
        this.selectedSub.set(res.data);
        this.getProducts();
      },
    });
  }

  getProducts() {
    this.isLoading.set(true);
    this._ProductsService
      .GetAllProducts({
        category: this.c_id(),
        subcategory: this.selectedSub()?._id,
        page: this.page(),
        limit: 12,
      })
      .subscribe({
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
