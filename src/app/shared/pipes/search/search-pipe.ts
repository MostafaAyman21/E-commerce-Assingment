import { Pipe, PipeTransform } from '@angular/core';
import { IProduct } from '../../../core/models/Product/iproduct.interface';

/** Filters products by title, category or brand name (the API has no text search). */
@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {
  transform(products: IProduct[], term: string | null | undefined): IProduct[] {
    const word = term?.trim().toLowerCase();
    if (!word) return products;
    return products.filter((p) =>
      [p.title, p.category?.name, p.brand?.name].join(' ').toLowerCase().includes(word),
    );
  }
}
