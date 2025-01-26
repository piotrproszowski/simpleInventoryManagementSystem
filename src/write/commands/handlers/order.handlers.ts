import { CreateOrderCommand, UpdateOrderStatusCommand } from "../commands";
import { orderRepository } from "../../repositories/order.repository";
import { productRepository } from "../../repositories/product.repository";
import { rabbitMQ } from "../../../infrastructure/messaging/rabbitmq";
import { IdGenerator } from "../../../shared/utils/id-generator";
import { OrderStatus } from "../../domain/models/order.model";
import { AppError } from "../../../api/middleware/error-handler";

export async function createOrderHandler(
  command: Omit<CreateOrderCommand, "id" | "timestamp">,
) {
  const products = await productRepository.findByIds(
    command.products.map((p) => p.productId),
  );

  const productPriceMap = new Map(products.map((p) => [p.id, p.price]));

  const orderData = {
    _id: IdGenerator.generate(),
    customerId: command.customerId,
    products: command.products.map((p) => ({
      productId: p.productId,
      quantity: p.quantity,
      price: productPriceMap.get(p.productId) ?? 0,
    })),
    status: OrderStatus.PENDING,
  };

  const order = await orderRepository.createOrder(orderData);

  await rabbitMQ.publish("order.created", {
    id: order.id,
    customerId: order.customerId,
    products: order.products,
    status: order.status,
    totalAmount: order.totalAmount,
    timestamp: new Date(),
  });

  return order;
}

export async function updateOrderStatusHandler(
  command: Omit<UpdateOrderStatusCommand, "id" | "timestamp">,
) {
  if (!Object.values(OrderStatus).includes(command.status as OrderStatus)) {
    throw new AppError(400, "Invalid order status");
  }

  const order = await orderRepository.updateOrderStatus(
    command.orderId,
    command.status as OrderStatus,
  );

  await rabbitMQ.publish("order.status.updated", {
    id: IdGenerator.generate(),
    orderId: order.id,
    previousStatus: order.status,
    currentStatus: command.status,
    timestamp: new Date(),
  });

  return order;
}
