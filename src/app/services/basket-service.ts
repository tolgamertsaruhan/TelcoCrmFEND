import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Basket } from '../models/basketmodels/Basket';


@Injectable({ providedIn: 'root' })
export class BasketService {
  private baseUrl = 'http://localhost:8091/basketservice/api/baskets';

  constructor(private http: HttpClient) {}

  getBasketByBillingAccountId(billingAccountId: string): Observable<Basket> {
    // @GetMapping("/{billingAccountId}")
    return this.http.get<Basket>(`${this.baseUrl}/${billingAccountId}`);
  }

  addToBasket(
    billingAccountId: string,
    productOfferId?: string | null,
    campaignId?: string | null
  ): Observable<void> {
    let params = new HttpParams().set('billingAccountId', billingAccountId);

    if (productOfferId) {
      params = params.set('productOfferId', productOfferId);
    }
    if (campaignId) {
      params = params.set('campaignId', campaignId);
    }

    // @PostMapping("/add")
    return this.http.post<void>(`${this.baseUrl}/add`, null, { params });
  }

  removeFromBasket(
    billingAccountId: string,
    productOfferId?: string | null,
    campaignId?: string | null
  ): Observable<Basket> {
    let params = new HttpParams().set('billingAccountId', billingAccountId);

    if (productOfferId) {
      params = params.set('productOfferId', productOfferId);
    }
    if (campaignId) {
      params = params.set('campaignId', campaignId);
    }

    // @DeleteMapping("/remove")
    return this.http.delete<Basket>(`${this.baseUrl}/remove`, { params });
  }

  clearBasket(billingAccountId: string): Observable<void> {
    const params = new HttpParams().set('billingAccountId', billingAccountId);
    // @DeleteMapping("/clear")
    return this.http.delete<void>(`${this.baseUrl}/clear`, { params });
  }
}
