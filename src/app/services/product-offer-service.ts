import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetProductOfferResponse } from '../models/catalogmodels/GetProductOfferResponse';


@Injectable({ providedIn: 'root' })
export class ProductOfferService {
  private baseUrl = 'http://localhost:8091/catalogservice/api/product-offers';
  // @GetMapping("{id}")

  constructor(private http: HttpClient) {}

  getProductOffer(id: string): Observable<GetProductOfferResponse> {
    return this.http.get<GetProductOfferResponse>(`${this.baseUrl}/${id}`);
  }
}
