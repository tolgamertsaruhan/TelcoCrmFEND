import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ConfigurationService {

  constructor(private http: HttpClient) {}

  getBasket(billingAccountId: string) {
    return this.http.get(`http://localhost:8091/basketservice/api/baskets/${billingAccountId}`);
  }

  getProductConfiguration(poId: string) {
    return this.http.get(`http://localhost:8091/catalogservice/api/product-offers/${poId}/configuration`);
  }

  getCustomerByBillingAccountId(billingAccountId: string) {
    return this.http.get(`http://localhost:8091/customerservice/api/billingAccounts/${billingAccountId}/customer-id`);
  }
}
