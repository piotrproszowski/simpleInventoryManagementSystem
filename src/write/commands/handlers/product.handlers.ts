import { CreateProductCommand, UpdateStockCommand } from "../commands";
import { productRepository } from "../../repositories/product.repository";
import { rabbitMQ } from "../../../infrastructure/messaging/rabbitmq";
import { IdGenerator } from "../../../shared/utils/id-generator";

export async function createProductHandler(
  command: Omit<CreateProductCommand, "id" | "timestamp">,
) {
  const product = await productRepository.create({
    ...command,
    _id: IdGenerator.generate(),
  });

  await rabbitMQ.publish("product.created", {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    timestamp: new Date(),
  });

  return product;
}

export async function updateStockHandler(
  command: Omit<UpdateStockCommand, "id" | "timestamp">,
) {
  const product = await productRepository.updateStock(
    command.productId,
    command.quantity,
  );

  await rabbitMQ.publish("product.stock.updated", {
    id: IdGenerator.generate(),
    productId: product.id,
    previousStock: product.stock - command.quantity,
    currentStock: product.stock,
    adjustment: command.quantity,
    timestamp: new Date(),
  });

  return product;
}
