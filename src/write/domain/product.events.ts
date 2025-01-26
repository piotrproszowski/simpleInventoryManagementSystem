import { DomainEvent } from "../../shared/domain/domain.event";

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

interface StockUpdateData {
  id: string;
  quantity: number;
  previousStock: number;
  newStock: number;
}

export class ProductCreatedEvent extends DomainEvent {
  constructor(public readonly data: ProductData) {
    super("ProductCreated", data.id, data);
  }
}

export class ProductStockUpdatedEvent extends DomainEvent {
  constructor(public readonly data: StockUpdateData) {
    super("ProductStockUpdated", data.id, data);
  }
}
