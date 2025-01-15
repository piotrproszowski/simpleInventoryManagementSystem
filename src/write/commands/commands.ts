import { EntityId } from "../../shared/utils/id-generator";

export interface BaseCommand {
  id: EntityId;
  timestamp: Date;
}

export interface CreateProductCommand extends BaseCommand {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateStockCommand extends BaseCommand {
  productId: EntityId;
  quantity: number;
}

export interface CreateOrderCommand extends BaseCommand {
  customerId: EntityId;
  products: Array<{
    productId: EntityId;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusCommand extends BaseCommand {
  orderId: EntityId;
  status: string;
}
