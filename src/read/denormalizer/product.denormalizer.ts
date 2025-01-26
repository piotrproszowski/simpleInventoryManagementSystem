import { ProductRepository } from "../repository/product.repository";
import { ProductReadModel } from "../model/product.read-model";
import { DomainEvent } from "../../shared/domain/domain.event";
import { Logger } from "../../shared/logger";

export class ProductDenormalizer {
  private readonly logger = new Logger(ProductDenormalizer.name);

  constructor(private readonly repository: ProductRepository) {}

  async handle(event: DomainEvent): Promise<void> {
    try {
      switch (event.type) {
        case "ProductCreated":
          await this.handleProductCreated(event);
          break;
        case "ProductStockUpdated":
          await this.handleStockUpdated(event);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error handling event ${event.type}:`, error);
      throw error;
    }
  }

  private async handleProductCreated(event: DomainEvent): Promise<void> {
    const product = new ProductReadModel({
      id: event.aggregateId,
      name: event.data.name,
      description: event.data.description,
      price: event.data.price,
      stock: event.data.stock,
      createdAt: event.occurredAt,
      updatedAt: event.occurredAt,
    });

    await this.repository.save(product);
  }

  private async handleStockUpdated(event: DomainEvent): Promise<void> {
    await this.repository.updateStock(
      event.aggregateId,
      event.data.quantity,
      event.occurredAt,
    );
  }
}
