import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IProductsQuery {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Service()
export class ProductsService {
  private _HttpClient = inject(HttpClient);

  GetAllProducts(query: IProductsQuery = {}): Observable<any> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.category) params = params.set('category[in]', query.category);
    if (query.subcategory) params = params.set('subcategory', query.subcategory);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.minPrice) params = params.set('price[gte]', query.minPrice);
    if (query.maxPrice) params = params.set('price[lte]', query.maxPrice);
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products`, { params });
  }
  GetSpecificProduct(p_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products/${p_id}`);
  }
}
