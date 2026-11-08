import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { ICategory, ISubCategory } from '../../core/models/Category/icategory.interface';

@Component({
  imports: [RouterLink],
  selector: 'app-categories',
  styleUrl: './categories.component.css',
  templateUrl: './categories.component.html',
})
export class CategoriesComponent {
  private _CategoriesService = inject(CategoriesService);

  categories = signal<ICategory[]>([]);
  subCategories = signal<ISubCategory[]>([]);

  /** Subcategories grouped by their category id. */
  subsByCategory = computed(() => {
    const groups: Record<string, ISubCategory[]> = {};
    for (const sub of this.subCategories()) (groups[sub.category] ??= []).push(sub);
    return groups;
  });

  ngOnInit() {
    this._CategoriesService.GetAllCategories().subscribe({
      next: (res) => this.categories.set(res.data),
    });
    this._CategoriesService.GetAllSubCategories().subscribe({
      next: (res) => this.subCategories.set(res.data),
    });
  }
}
