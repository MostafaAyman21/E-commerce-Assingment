import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class ReviewsService {
  private _HttpClient = inject(HttpClient);

  GetAllReviewsForProduct(p_id: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/products/${p_id}/reviews?limit=100`);
  }
  CreateReview(p_id: string, data: { review: string; rating: number }): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/products/${p_id}/reviews`, data);
  }
  UpdateReview(r_id: string, data: { review: string; rating: number }): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/reviews/${r_id}`, data);
  }
  DeleteReview(r_id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/reviews/${r_id}`);
  }
}
