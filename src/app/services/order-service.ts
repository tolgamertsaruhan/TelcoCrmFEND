import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { OrderResponse } from "../models/ordermodels/OrderResponse";

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8091/salesservice/api/orders';
  constructor(private http: HttpClient) {}

  createOrder(payload: any) {
    return this.http.post(`http://localhost:8091/salesservice/api/orders`, payload);
  }

   getOrderById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }
}