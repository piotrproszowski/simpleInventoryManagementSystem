import { ProductAggregate } from "../../../../write/domain/product.aggregate";
import { DomainError } from "../../../../shared/errors/domain.error";
import {
  ProductCreatedEvent,
  ProductStockUpdatedEvent,
} from "../../../../write/domain/product.events";

describe("ProductAggregate", () => {
  const productId = "test-id";
  let aggregate: ProductAggregate;

  beforeEach(() => {
    aggregate = new ProductAggregate(productId);
  });

  describe("create", () => {
    it("should create a product and emit ProductCreatedEvent", () => {
      aggregate.create("Test Product", "Description", 100, 10);

      const events = aggregate.uncommittedEvents;
      expect(events).toHaveLength(1);
      const event = events[0] as ProductCreatedEvent;
      expect(event.type).toBe("ProductCreated");
      expect(event.data).toEqual({
        id: productId,
        name: "Test Product",
        description: "Description",
        price: 100,
        stock: 10,
      });
    });

    it("should throw error when creating existing product", () => {
      aggregate.create("Test Product", "Description", 100, 10);

      expect(() => {
        aggregate.create("Test Product", "Description", 100, 10);
      }).toThrow(DomainError);
    });
  });

  describe("updateStock", () => {
    beforeEach(() => {
      aggregate.create("Test Product", "Description", 100, 10);
      aggregate.clearEvents();
    });

    it("should update stock and emit ProductStockUpdatedEvent", () => {
      aggregate.updateStock(5);

      const events = aggregate.uncommittedEvents;
      expect(events).toHaveLength(1);
      const event = events[0] as ProductStockUpdatedEvent;
      expect(event.type).toBe("ProductStockUpdated");
      expect(event.data).toEqual({
        id: productId,
        quantity: 5,
        previousStock: 10,
        newStock: 15,
      });
    });

    it("should throw error when reducing stock below zero", () => {
      expect(() => {
        aggregate.updateStock(-15);
      }).toThrow(DomainError);
    });

    it("should throw error when product does not exist", () => {
      const newAggregate = new ProductAggregate("other-id");

      expect(() => {
        newAggregate.updateStock(5);
      }).toThrow(DomainError);
    });
  });
});
