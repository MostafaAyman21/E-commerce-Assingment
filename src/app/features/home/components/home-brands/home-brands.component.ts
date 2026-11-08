import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { BrandsService } from '../../../../core/services/Brands/brands.service';
import { IBrand } from '../../../../core/models/Brand/ibrand.interface';

@Component({
  imports: [RouterLink, CarouselModule],
  selector: 'app-home-brands',
  styleUrl: './home-brands.component.css',
  templateUrl: './home-brands.component.html',
})
export class HomeBrandsComponent {
  private _BrandsService = inject(BrandsService);
  brands = signal<IBrand[]>([]);

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 2500,
    autoplayHoverPause: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    margin: 12,
    responsive: {
      0: { items: 2 },
      640: { items: 4 },
      1024: { items: 6 },
    },
  };

  ngOnInit() {
    this._BrandsService.GetAllBrands(1, 20).subscribe({
      next: (res) => this.brands.set(res.data),
    });
  }
}
