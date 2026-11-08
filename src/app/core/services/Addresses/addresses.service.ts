import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class AddressesService {
  private _HttpClient = inject(HttpClient);

  AddAddress(data: object): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/addresses`, data);
  }
  RemoveAddress(a_id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/addresses/${a_id}`);
  }
  GetSpecificAddress(a_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/addresses/${a_id}`);
  }
  GetLoggedUserAddresses(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/addresses`);
  }
}
