import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error-handler";

export class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({
        status: "success",
        data: {
          message: "createProduct",
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
      res.json({
        status: "success",
        data: {
          message: "restockProduct",
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

      res.json({
        status: "success",
        data: { message: "sellProduct" },
      });
    } catch (error) {
      next(error);
    }
  }
}
