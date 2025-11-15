import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BillingAccount } from '../models/individualcustomer/billingAccount';
import { UpdateBillingAccountRequest } from '../models/individualcustomer/requests/UpdateBillingAccountRequest';
import { BillingAccountRequest } from '../models/individualcustomer/requests/BillingAccountRequest';
import { BillingAccountResponse } from '../models/individualcustomer/responses/BillingAccountResponse';


@Injectable({ providedIn: 'root' })
export class BillingAccountService {
  private baseUrl = 'http://localhost:8091/customerservice/api/billingAccounts';

  constructor(private http: HttpClient) {}

  getByCustomerId(customerId: string): Observable<BillingAccount[]> {
    return this.http.get<BillingAccount[]>(
      `${this.baseUrl}/by-customer-bill/${customerId}`
    );
  }

  /*add(account: Partial<BillingAccount>): Observable<BillingAccount> {
    return this.http.post<BillingAccount>(`${this.baseUrl}`, account);
  }

  update(account: BillingAccount): Observable<BillingAccount> {
    return this.http.put<UpdateBillingAccountRequest>(`${this.baseUrl}`, account);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/soft`);
  }*/


   // 🔹 Add
  add(account: BillingAccountRequest): Observable<BillingAccountResponse> {
    return this.http.post<BillingAccountResponse>(`${this.baseUrl}`, account);
  }

  // 🔹 Update
  update(account: UpdateBillingAccountRequest): Observable<BillingAccountResponse> {
    return this.http.put<BillingAccountResponse>(`${this.baseUrl}`, account);
  }

  // 🔹 Soft Delete
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/soft`);
  }

  getCustomerIdByBillingAccountId(billingAccountId: string) {
  return this.http.get<string>(`${this.baseUrl}/${billingAccountId}/customer-id`);
}
}