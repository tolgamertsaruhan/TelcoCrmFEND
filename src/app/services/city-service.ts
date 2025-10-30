import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CityService {

    private baseUrl = 'http://localhost:8091/customerservice/api/cities';
  constructor(private http: HttpClient) {}

  getCities(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl);
  }

  /*getDistrictsByCity(cityId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${cityId}/districts`);
  }*/
}
