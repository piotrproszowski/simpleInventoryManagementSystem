import { rabbitMQ } from "../../../infrastructure/messaging/rabbitmq";
import {
  ProductCreatedEvent,
  ProductStockUpdatedEvent,
  OrderCreatedEvent,
  OrderStatusUpdatedEvent,
  BaseEvent,
} from "../events";

type EventValidator<T extends BaseEvent> = (event: unknown) => event is T;

const isProductCreatedEvent: EventValidator<ProductCreatedEvent> = (
  event: unknown,
): event is ProductCreatedEvent => {
  const e = event as ProductCreatedEvent;
  return (
    !!e?.productId &&
    !!e?.name &&
    typeof e?.price === "number" &&
    typeof e?.stock === "number"
  );
};

const isProductStockUpdatedEvent: EventValidator<ProductStockUpdatedEvent> = (
  event: unknown,
): event is ProductStockUpdatedEvent => {
  const e = event as ProductStockUpdatedEvent;
  return (
    !!e?.productId &&
    typeof e?.previousStock === "number" &&
    typeof e?.currentStock === "number"
  );
};

const isOrderCreatedEvent: EventValidator<OrderCreatedEvent> = (
  event: unknown,
): event is OrderCreatedEvent => {
  const e = event as OrderCreatedEvent;
  return !!e?.orderId && !!e?.customerId && Array.isArray(e?.products);
};

const isOrderStatusUpdatedEvent: EventValidator<OrderStatusUpdatedEvent> = (
  event: unknown,
): event is OrderStatusUpdatedEvent => {
  const e = event as OrderStatusUpdatedEvent;
  return !!e?.orderId && !!e?.previousStatus && !!e?.currentStatus;
};

export class EventHandler {
  static async handleProductCreated(event: ProductCreatedEvent): Promise<void> {
    await rabbitMQ.publish("inventory.product.created", {
      ...event,
      eventType: "ProductCreated",
    });
  }

  static async handleProductStockUpdated(
    event: ProductStockUpdatedEvent,
  ): Promise<void> {
    await rabbitMQ.publish("inventory.product.stock.updated", {
      ...event,
      eventType: "ProductStockUpdated",
    });
  }

  static async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await rabbitMQ.publish("inventory.order.created", {
      ...event,
      eventType: "OrderCreated",
    });
  }

  static async handleOrderStatusUpdated(
    event: OrderStatusUpdatedEvent,
  ): Promise<void> {
    await rabbitMQ.publish("inventory.order.status.updated", {
      ...event,
      eventType: "OrderStatusUpdated",
    });
  }
}

// Event subscribers
export async function setupEventSubscribers(): Promise<void> {
  await rabbitMQ.subscribe(
    "product_events",
    "product.created",
    async (message: unknown) => {
      if (isProductCreatedEvent(message)) {
        await EventHandler.handleProductCreated(message);
      }
    },
  );

  await rabbitMQ.subscribe(
    "product_events",
    "product.stock.updated",
    async (message: unknown) => {
      if (isProductStockUpdatedEvent(message)) {
        await EventHandler.handleProductStockUpdated(message);
      }
    },
  );

  await rabbitMQ.subscribe(
    "order_events",
    "order.created",
    async (message: unknown) => {
      if (isOrderCreatedEvent(message)) {
        await EventHandler.handleOrderCreated(message);
      }
    },
  );

  await rabbitMQ.subscribe(
    "order_events",
    "order.status.updated",
    async (message: unknown) => {
      if (isOrderStatusUpdatedEvent(message)) {
        await EventHandler.handleOrderStatusUpdated(message);
      }
    },
  );
}
