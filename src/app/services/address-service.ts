import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Address } from '../models/individualcustomer/responses/individualCustomerListResponse';
import { UpdateAddressRequest } from '../models/individualcustomer/requests/UpdateAddressRequest';
import { CreateAddressRequest } from '../models/individualcustomer/requests/CreateAddressRequest';
import { GetAddressResponse } from '../models/individualcustomer/responses/GetAddressResponse';


@Injectable({
  providedIn: 'root',
})
export class AddressService {

  private baseUrl = 'http://localhost:8091/customerservice/api/addresses'; // Backend endpoint, kendi API'na göre değiştir

  constructor(private http: HttpClient) {}

  // Tüm adresleri müşteri ID'sine göre getir
  getAddressesByCustomerId(customerId: string): Observable<CreatedAddressResponse[]> {
    return this.http.get<CreatedAddressResponse[]>(`${this.baseUrl}/by-customer/${customerId}`);
  }

  // Yeni adres ekle
  addAddress(address: Address & { customerId: string }): Observable<CreatedAddressResponse> {
    return this.http.post<CreatedAddressResponse>(`${this.baseUrl}`, address);
  }

  addAddressInfoPage(request: CreateAddressRequest): Observable<CreatedAddressResponse> {
  return this.http.post<CreatedAddressResponse>(`${this.baseUrl}`, request);
}

 getAddressById(addressId: string) {
    return this.http.get<GetAddressResponse>(`${this.baseUrl}/${addressId}`);
  }

  // Var olan adresi güncelle
  /*updateAddress(addressId: string, address: Address): Observable<CreatedAddressResponse> {
    return this.http.put<CreatedAddressResponse>(`${this.baseUrl}`, address);
  }
*/

updateAddress(request: UpdateAddressRequest): Observable<any> {
   
  return this.http.put(`${this.baseUrl}`, request); // id body'de gönderiliyor
}
  // Adres sil
  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${addressId}/soft`);
  }
}