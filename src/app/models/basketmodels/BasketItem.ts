export interface BasketItem {
  id: string;
  campaignProductOfferId: string;
  productName: string;
  price: number;
  productOfferId: string | null;
  campaignId: string | null;
  discountRate: number | null;
  quantity: number;
  discountedPrice: number | null;
}