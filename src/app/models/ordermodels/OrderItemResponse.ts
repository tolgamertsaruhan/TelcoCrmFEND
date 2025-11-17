export interface OrderItemResponse {
  productId: string;
  productOfferId: string;
  productName: string;
  price: number;
  discountedPrice: number | null;
  discountedRate: number | null;
  configurationValues: { [key: string]: string };
}