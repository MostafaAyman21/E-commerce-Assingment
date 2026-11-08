import { Component, inject, signal } from '@angular/core';
import { ProductsService } from '../../../../core/services/Porducts/products.service';
import { IProduct } from '../../../../core/models/Product/iproduct.interface';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { RouterLink } from '@angular/router';

@Component({
  imports: [ProductCardComponent, RouterLink],
  selector: 'app-home-products',
  styleUrl: './home-products.component.css',
  templateUrl: './home-products.component.html',
})
export class HomeProductsComponent {
  private _ProductsService = inject(ProductsService);
  products = signal<IProduct[]>([]);

  ngOnInit() {
    this.getFeaturedProducts();
  }

  getFeaturedProducts() {
    this._ProductsService.GetAllProducts().subscribe({
      next: (res) => {
        // Featured = the top rated products.
        this.products.set(res.data.filter((p: IProduct) => p.ratingsAverage > 4));
      },
    });
  }
}
