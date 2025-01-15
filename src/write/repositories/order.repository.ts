import { EntityId } from "../../shared/utils/id-generator";
import { BaseRepository } from "./base.repository";
import { IOrder, OrderModel, OrderStatus } from "../domain/models/order.model";
import { AppError } from "../../api/middleware/error-handler";
import { productRepository } from "./product.repository";

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }

  async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    const session = await this.model.startSession();
    let order: IOrder;

    try {
      await session.withTransaction(async () => {
        const stockCheck = await productRepository.checkStockAvailability(
          orderData.products!.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        );

        if (!stockCheck.success) {
          throw new AppError(422, "Insufficient stock", [
            {
              field: "products",
              message: `Insufficient stock for products: ${stockCheck.insufficientProducts.join(
                ", ",
              )}`,
            },
          ]);
        }

        order = await this.create(orderData);

        await productRepository.bulkUpdateStock(
          orderData.products!.map((p) => ({
            productId: p.productId,
            quantity: -p.quantity,
          })),
        );
      });

      return order!;
    } finally {
      session.endSession();
    }
  }

  async updateOrderStatus(
    orderId: EntityId,
    status: OrderStatus,
  ): Promise<IOrder> {
    const order = await this.findById(orderId);

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new AppError(
        400,
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    const updatedOrder = await this.update(orderId, {
      status,
      version: order.version + 1,
    });

    if (!updatedOrder) {
      throw new AppError(409, "Order was updated by another process");
    }

    return updatedOrder;
  }

  async getOrdersByCustomer(
    customerId: EntityId,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ orders: IOrder[]; total: number }> {
    const [orders, total] = await Promise.all([
      this.model
        .find({ customerId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec(),
      this.model.countDocuments({ customerId }),
    ]);

    return { orders, total };
  }

  async cancelOrder(orderId: EntityId): Promise<IOrder> {
    const session = await this.model.startSession();

    try {
      await session.withTransaction(async () => {
        const order = await this.findById(orderId);

        if (!order) {
          throw new AppError(404, "Order not found");
        }

        if (
          ![OrderStatus.PENDING, OrderStatus.PROCESSING].includes(order.status)
        ) {
          throw new AppError(400, "Order cannot be cancelled");
        }

        await productRepository.bulkUpdateStock(
          order.products.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        );

        const updatedOrder = await this.updateOrderStatus(
          orderId,
          OrderStatus.CANCELLED,
        );

        if (!updatedOrder) {
          throw new AppError(409, "Order was updated by another process");
        }

        return updatedOrder;
      });
    } finally {
      session.endSession();
    }

    return this.findById(orderId) as Promise<IOrder>;
  }
}

export const orderRepository = new OrderRepository();
