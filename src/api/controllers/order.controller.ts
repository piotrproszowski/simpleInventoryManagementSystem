import { Request, Response, NextFunction } from "express";
import { createOrderHandler } from "./../../write/commands/handlers/order.handlers";
import { IOrder } from "../../write/domain/models/order.model";
import { AppError } from "../middleware/error-handler";

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, products } = req.body;

      if (
        !customerId ||
        !products ||
        !Array.isArray(products) ||
        products.length === 0
      ) {
        throw new AppError(400, "Invalid order data");
      }

      const order: IOrder = await createOrderHandler({
        customerId,
        products: products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      });

      res.status(201).json({
        status: "success",
        data: {
          order: order.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      // [todo] Implement getOrder method
    } catch (error) {
      next(error);
    }
  }
}
