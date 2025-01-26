import { EntityId } from "../../shared/utils/id-generator";
import { OrderStatus } from "../domain/models/order.model";

export interface BaseEvent {
  id: EntityId;
  timestamp: Date;
  version: number;
}

export interface ProductCreatedEvent extends BaseEvent {
  productId: EntityId;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductStockUpdatedEvent extends BaseEvent {
  productId: EntityId;
  previousStock: number;
  currentStock: number;
  adjustment: number;
}

export interface OrderCreatedEvent extends BaseEvent {
  orderId: EntityId;
  customerId: EntityId;
  products: Array<{
    productId: EntityId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
}

export interface OrderStatusUpdatedEvent extends BaseEvent {
  orderId: EntityId;
  previousStatus: OrderStatus;
  currentStatus: OrderStatus;
}
