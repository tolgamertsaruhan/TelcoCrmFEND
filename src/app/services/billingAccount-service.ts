import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillingAccount } from '../models/individualcustomer/billingAccount';


@Injectable({ providedIn: 'root' })
export class BillingAccountService {
  private baseUrl = 'http://localhost:8091/customerservice/api/billingAccounts';

  constructor(private http: HttpClient) {}

  getByCustomerId(customerId: string): Observable<BillingAccount[]> {
    return this.http.get<BillingAccount[]>(
      `${this.baseUrl}/by-customer-bill/${customerId}`
    );
  }

  add(account: Partial<BillingAccount>): Observable<BillingAccount> {
    return this.http.post<BillingAccount>(`${this.baseUrl}`, account);
  }

  update(account: BillingAccount): Observable<BillingAccount> {
    return this.http.put<BillingAccount>(`${this.baseUrl}`, account);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/soft`);
  }
}