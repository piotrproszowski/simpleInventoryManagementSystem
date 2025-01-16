import { Request, Response, NextFunction } from "express";
import {
  createProductHandler,
  updateStockHandler,
} from "../../write/commands/handlers/product.handlers";
import { AppError } from "../middleware/error-handler";
import { dbConnections } from "../../infrastructure/database/mongodb";

export class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(
        "Database connection status:",
        dbConnections.getWriteConnection().isConnected(),
      );
      const product = await createProductHandler(req.body);

      res.status(201).json({
        status: "success",
        data: {
          product: product.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async restockProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        throw new AppError(400, "Restock quantity must be greater than 0");
      }

      const product = await updateStockHandler({
        productId: id,
        quantity: Math.abs(quantity),
      });

      res.json({
        status: "success",
        data: {
          product: product.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async sellProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        throw new AppError(400, "Sell quantity must be greater than 0");
      }

      const product = await updateStockHandler({
        productId: id,
        quantity: -Math.abs(quantity),
      });

      res.json({
        status: "success",
        data: {
          product: product.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
