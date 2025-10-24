import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndividualCustomerListResponse } from '../models/individualcustomer/responses/individualCustomerListResponse';
import { Observable } from 'rxjs/internal/Observable';
import { IndividualCustomerSearchRequest } from '../models/individualcustomer/requests/individualCustomerSearchRequest';

@Injectable({
  providedIn: 'root'
})
export class CustomerSearchService {
  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search/search?'
  constructor(private http: HttpClient) { }

  searchCustomers(request: IndividualCustomerSearchRequest): Observable<IndividualCustomerListResponse[]> {
    let httpParams = new HttpParams();

    // Sadece değeri olan alanları HttpParams'e ekle
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
    
    // UI'daki GSM Number (gsmNumber) bilgisini, BE'nin beklediği 'mobilePhone' parametresi olarak gönder.
    if (request.gsmNumber) {
      httpParams = httpParams.set('mobilePhone', request.gsmNumber);
    }

    // Diğer alanları (middleName, orderNumber) BE request'ine dahil etmiyoruz.

    return this.http.get<IndividualCustomerListResponse[]>(this.apiUrl, { params: httpParams });
  }
}
