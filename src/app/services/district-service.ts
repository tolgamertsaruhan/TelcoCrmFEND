import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DistrictService {

    private baseUrl = 'http://localhost:8091/customerservice/api/districts';
  constructor(private http: HttpClient) {}

  

  getDistrictsByCity(cityId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getByCityId/${cityId}`);
  }

  getDistrictById(districtId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${districtId}`);
  }
}
