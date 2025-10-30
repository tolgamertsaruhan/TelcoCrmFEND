import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IndividualCustomerListResponse } from '../models/individualcustomer/responses/individualCustomerListResponse';
import { Observable } from 'rxjs';
import { IndividualCustomerCreateRequest } from '../models/individualcustomer/requests/individualCustomerCreateRequest';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  public baseUrl = 'http://localhost:8091/customerservice/api/districts';
  constructor(private httpClient: HttpClient) {}



  getIndividualCustomers(): Observable<IndividualCustomerListResponse[]> {
    return this.httpClient.get<IndividualCustomerListResponse[]>(
      'http://localhost:8091/customerservice/api/individual-customers/'
    );
  }

// http://localhost:8091/customerservice/api/individual-customers
  createIndividualCustomer(request: IndividualCustomerCreateRequest): Observable<any> {
  return this.httpClient.post('http://localhost:8091/customerservice/api/individual-customers/', request);
}
}
