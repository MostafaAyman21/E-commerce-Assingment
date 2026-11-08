import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class BrandsService {
  private _HttpClient = inject(HttpClient);

  GetAllBrands(page = 1, limit = 100): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/brands?page=${page}&limit=${limit}`);
  }
  GetSpecificBrand(b_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/brands/${b_id}`);
  }
}
