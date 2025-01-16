import { CommandHandler } from "../commands/types/command.type";
import { CreateProductCommand } from "../commands/product/create-product.command";
import { UpdateProductStockCommand } from "../commands/product/update-stock.command";
import { ProductAggregate } from "../domain/product.aggregate";
import { EventStore } from "../event-store/event.store";
import { Logger } from "../../shared/logger";
import { DomainError } from "../../shared/errors/domain.error";

export class ProductCommandHandler
  implements
    CommandHandler<CreateProductCommand>,
    CommandHandler<UpdateProductStockCommand>
{
  private readonly logger = new Logger(ProductCommandHandler.name);

  constructor(private readonly eventStore: EventStore) {}

  async handle(
    command: CreateProductCommand | UpdateProductStockCommand,
  ): Promise<void> {
    try {
      if (command instanceof CreateProductCommand) {
        await this.handleCreate(command);
      } else if (command instanceof UpdateProductStockCommand) {
        await this.handleUpdateStock(command);
      }
    } catch (error) {
      this.logger.error(`Error handling command ${command.type}:`, error);
      throw error;
    }
  }

  private async handleCreate(command: CreateProductCommand): Promise<void> {
    const aggregate = new ProductAggregate(command.id);

    aggregate.create(
      command.name,
      command.description,
      command.price,
      command.stock,
    );

    await this.eventStore.save(aggregate.uncommittedEvents);
  }

  private async handleUpdateStock(
    command: UpdateProductStockCommand,
  ): Promise<void> {
    const aggregate = new ProductAggregate(command.productId);
    const events = await this.eventStore.getEvents(command.productId);

    if (!events.length) {
      throw new DomainError("Product not found");
    }

    aggregate.loadFromHistory(events);
    aggregate.updateStock(command.quantity);
    await this.eventStore.save(aggregate.uncommittedEvents);
  }
}
