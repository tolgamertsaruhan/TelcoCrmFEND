export interface GetProductOfferResponse {
  id: string;
  name: string;
  description: string;
  startDate: string; // LocalDateTime
  endDate: string;
  price: number;
  status: string; // ProductOfferStatuses
  specificationId: string;
}