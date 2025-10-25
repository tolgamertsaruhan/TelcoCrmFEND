import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IndividualCustomerSearchRequest } from '../models/individualcustomer/requests/individualCustomerSearchRequest';
import { IndividualCustomerSearchResponse } from '../models/individualcustomer/responses/individualCustomerSearchResponse';

@Injectable({
  providedIn: 'root'
})
export class CustomerSearchService {
  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search/search';

  constructor(private http: HttpClient) { }

  searchCustomers(request: IndividualCustomerSearchRequest): Observable<IndividualCustomerSearchResponse[]> {
    let httpParams = new HttpParams();

    if (request.id) {
      httpParams = httpParams.set('id', request.id);
    }
    if (request.customerNumber) {
      httpParams = httpParams.set('customerNumber', request.customerNumber);
    }
    if (request.nationalId) {
      httpParams = httpParams.set('nationalId', request.nationalId);
    }
    if (request.firstName) {
      httpParams = httpParams.set('firstName', request.firstName);
    }
    if (request.lastName) {
      httpParams = httpParams.set('lastName', request.lastName);
    }

    // Backend'in beklediği parametre adı
    if (request.gsmNumber) {
      httpParams = httpParams.set('value', request.gsmNumber);
    }

    return this.http.get<IndividualCustomerSearchResponse[]>(this.apiUrl, { params: httpParams });
  }
}
