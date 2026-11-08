import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class CategoriesService {
  private _HttpClient = inject(HttpClient);

  GetAllCategories(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/categories`);
  }
  GetSpecificCategory(c_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/categories/${c_id}`);
  }
  GetAllSubCategoriesOnCategory(c_id: string): Observable<any> {
    // The nested route /categories/:id/subcategories currently ignores the id on the API,
    // so filter the subcategories resource by category instead.
    return this._HttpClient.get(`${environment.baseURL}/api/v1/subcategories?category=${c_id}`);
  }
  GetAllSubCategories(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/subcategories?limit=100`);
  }
  GetSpecificSubCategory(sub_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/subcategories/${sub_id}`);
  }
}
