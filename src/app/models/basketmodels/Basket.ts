import { BasketItem } from "./BasketItem";

export interface Basket {
  id: string;
  billingAccountId: string;
  totalPrice: number;
  basketItems: BasketItem[];
}