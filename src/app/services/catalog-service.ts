import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetListCatalogResponse } from '../models/catalogmodels/GetListCatalogResponse';
import { GetListCatalogProductOfferResponse } from '../models/catalogmodels/GetListCatalogProductOfferResponse';


@Injectable({ providedIn: 'root' })
export class CatalogService {
  private baseUrl = 'http://localhost:8091/catalogservice/api/catalogs'; 
  // ↑ kendi base path’ine göre güncelle

  private catalogProductOfferUrl = 'http://localhost:8091/catalogservice/api/catalog-product-offers';
  // ↑ @GetMapping("/get-product-offers-by-catalog/{catalogId}")
  //    @GetMapping("/search-by-catalog-prod-offer")

  constructor(private http: HttpClient) {}

  getAllCatalogs(): Observable<GetListCatalogResponse[]> {
    // @GetMapping public List<GetListCatalogResponse> getAll()
    return this.http.get<GetListCatalogResponse[]>(`${this.baseUrl}`);
  }

  getProductOffersByCatalogId(catalogId: string): Observable<GetListCatalogProductOfferResponse[]> {
    return this.http.get<GetListCatalogProductOfferResponse[]>(
      `${this.catalogProductOfferUrl}/get-product-offers-by-catalog/${catalogId}`
    );
  }

  searchProductOffersByCatalogIdAndName(
    catalogId: string,
    productOfferName: string
  ): Observable<GetListCatalogProductOfferResponse[]> {
    const params = new HttpParams()
      .set('catalogId', catalogId)
      .set('productOfferName', productOfferName);
    return this.http.get<GetListCatalogProductOfferResponse[]>(
      `${this.catalogProductOfferUrl}/search-by-catalog-prod-offer`,
      { params }
    );
  }
}
