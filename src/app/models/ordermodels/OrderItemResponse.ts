export interface OrderItemResponse {
  productName: string;
  price: number;
  discountedPrice: number | null;
  configurationValues: { [key: string]: string };
}