import { AggregateRoot } from "../../shared/domain/aggregate.root";
import {
  ProductCreatedEvent,
  ProductStockUpdatedEvent,
} from "./product.events";
import { DomainError } from "../../shared/errors/domain.error";
import { DomainEvent } from "../../shared/domain/domain.event";

export class ProductAggregate extends AggregateRoot {
  private _id: string;
  private _name!: string;
  private _description!: string;
  private _price!: number;
  private _stock!: number;

  constructor(id: string) {
    super();
    this._id = id;
  }

  create(
    name: string,
    description: string,
    price: number,
    stock: number,
  ): void {
    if (this._name) {
      throw new DomainError("Product already exists");
    }

    this.applyEvent(
      new ProductCreatedEvent({
        id: this._id,
        name,
        description,
        price,
        stock,
      }),
    );
  }

  updateStock(quantity: number): void {
    if (!this._name) {
      throw new DomainError("Product does not exist");
    }

    if (this._stock + quantity < 0) {
      throw new DomainError("Insufficient stock");
    }

    this.applyEvent(
      new ProductStockUpdatedEvent({
        id: this._id,
        quantity,
        previousStock: this._stock,
        newStock: this._stock + quantity,
      }),
    );
  }

  loadFromHistory(events: DomainEvent[]): void {
    events.forEach((event) => this.applyEvent(event));
  }

  // Event handlers
  private onProductCreated(event: ProductCreatedEvent): void {
    this._name = event.data.name;
    this._description = event.data.description;
    this._price = event.data.price;
    this._stock = event.data.stock;
  }

  private onProductStockUpdated(event: ProductStockUpdatedEvent): void {
    this._stock = event.data.newStock;
  }
}
