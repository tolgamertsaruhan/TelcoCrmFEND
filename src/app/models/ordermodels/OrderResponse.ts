import { OrderItemResponse } from "./OrderItemResponse";


export interface OrderResponse {
  orderId: string;
  totalAmount: number;
  serviceAddress: string;
  orderDate: string;
  orderItems: OrderItemResponse[];
}