import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandsService } from '../../core/services/Brands/brands.service';
import { IBrand } from '../../core/models/Brand/ibrand.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-brands',
  styleUrl: './brands.component.css',
  templateUrl: './brands.component.html',
})
export class BrandsComponent {
  private _BrandsService = inject(BrandsService);

  brands = signal<IBrand[]>([]);
  results = signal<number>(0);
  numberOfPages = signal<number>(1);
  page = signal<number>(1);
  term = signal<string>('');
  isLoading = signal<boolean>(true);

  pages = computed(() => Array.from({ length: this.numberOfPages() }, (_, i) => i + 1));
  filteredBrands = computed(() => {
    const word = this.term().trim().toLowerCase();
    return word ? this.brands().filter((b) => b.name.toLowerCase().includes(word)) : this.brands();
  });

  ngOnInit() {
    this.getBrands();
  }

  getBrands() {
    this.isLoading.set(true);
    this._BrandsService.GetAllBrands(this.page(), 24).subscribe({
      next: (res) => {
        this.brands.set(res.data);
        this.results.set(res.results);
        this.numberOfPages.set(res.metadata.numberOfPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  goToPage(page: number) {
    this.page.set(page);
    this.getBrands();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
