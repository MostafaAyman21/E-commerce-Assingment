import { HomeCategoriesComponent } from './components/home-categories/home-categories.component';
import { HomeProductsComponent } from './components/home-products/home-products.component';
import { HomeSliderComponent } from './components/home-slider/home-slider.component';
import { HomeBrandsComponent } from './components/home-brands/home-brands.component';
import { Component } from '@angular/core';

@Component({
  imports: [HomeSliderComponent, HomeCategoriesComponent, HomeProductsComponent, HomeBrandsComponent],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
