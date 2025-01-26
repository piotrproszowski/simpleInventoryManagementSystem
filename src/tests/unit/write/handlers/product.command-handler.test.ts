import { ProductCommandHandler } from "../../../../write/handlers/product.command-handler";
import { EventStore } from "../../../../write/event-store/event.store";
import { CreateProductCommand } from "../../../../write/commands/product/create-product.command";
import { UpdateProductStockCommand } from "../../../../write/commands/product/update-stock.command";
import { DomainError } from "../../../../shared/errors/domain.error";
import {
  ProductCreatedEvent,
  ProductStockUpdatedEvent,
} from "../../../../write/domain/product.events";

describe("ProductCommandHandler", () => {
  let handler: ProductCommandHandler;
  let eventStore: jest.Mocked<EventStore>;

  beforeEach(() => {
    eventStore = {
      save: jest.fn(),
      getEvents: jest.fn(),
    } as any;

    handler = new ProductCommandHandler(eventStore);
  });

  describe("CreateProductCommand", () => {
    it("should create a new product and save events", async () => {
      const command = new CreateProductCommand(
        "123",
        "Test Product",
        "Description",
        100,
        10,
      );

      await handler.handle(command);

      expect(eventStore.save).toHaveBeenCalledTimes(1);
      expect(eventStore.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: "ProductCreated",
            aggregateId: "123",
          }),
        ]),
      );
    });
  });

  describe("UpdateProductStockCommand", () => {
    it("should update stock and save events", async () => {
      const existingEvents = [
        {
          type: "ProductCreated",
          aggregateId: "123",
          data: {
            id: "123",
            name: "Test",
            description: "Test",
            price: 100,
            stock: 10,
          },
          occurredAt: new Date(),
        },
      ];

      eventStore.getEvents.mockResolvedValue(existingEvents);

      const command = new UpdateProductStockCommand("123", 5);

      await handler.handle(command);

      expect(eventStore.save).toHaveBeenCalledTimes(1);
      expect(eventStore.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: "ProductStockUpdated",
            aggregateId: "123",
          }),
        ]),
      );
    });

    it("should throw DomainError when product not found", async () => {
      eventStore.getEvents.mockResolvedValue([]);

      const command = new UpdateProductStockCommand("123", 5);

      await expect(handler.handle(command)).rejects.toThrow(DomainError);
    });
  });
});
