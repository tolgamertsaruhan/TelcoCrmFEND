import { OrderItemResponse } from "./OrderItemResponse";


export interface OrderResponse {
  orderId: string;
  totalAmount: number;
  serviceAddress: string;
  orderItems: OrderItemResponse[];
}