import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GetListCampaignResponse } from '../models/catalogmodels/GetListCampaignResponse';
import { GetCampaignResponse } from '../models/catalogmodels/GetCampaignResponse';
import { GetCampaignProductOfferResponse } from '../models/catalogmodels/GetCampaignProductOfferResponse';
import { GetListCampaignProductOfferResponse } from '../models/catalogmodels/GetListCampaignProductOfferResponse';


@Injectable({ providedIn: 'root' })
export class CampaignService {
  private baseUrl = 'http://localhost:8091/catalogservice/api/campaigns';
  // @GetMapping public List<GetListCampaignResponse> getAll()
  // @GetMapping("/{id}") public GetCampaignResponse getById(@PathVariable UUID id)

  private campaignProductOfferUrl = 'http://localhost:8091/catalogservice/api/campaign-product-offers';
  // @GetMapping("/by-campaign/{campaignId}")
  // @GetMapping("/search")

  constructor(private http: HttpClient) {}

  getAllCampaigns(): Observable<GetListCampaignResponse[]> {
    return this.http.get<GetListCampaignResponse[]>(`${this.baseUrl}`);
  }

  getCampaignById(id: string): Observable<GetCampaignResponse> {
    return this.http.get<GetCampaignResponse>(`${this.baseUrl}/${id}`);
  }

  getCampaignProductOffersByCampaignId(campaignId: string): Observable<GetCampaignProductOfferResponse[]> {
    return this.http.get<GetCampaignProductOfferResponse[]>(
      `${this.campaignProductOfferUrl}/by-campaign/${campaignId}`
    );
  }

  searchCampaignProductOffers(
    campaignId: string,
    productOfferName: string
  ): Observable<GetListCampaignProductOfferResponse[]> {
    const params = new HttpParams()
      .set('campaignId', campaignId)
      .set('productOfferName', productOfferName);
    return this.http.get<GetListCampaignProductOfferResponse[]>(
      `${this.campaignProductOfferUrl}/search`,
      { params }
    );
  }
}
