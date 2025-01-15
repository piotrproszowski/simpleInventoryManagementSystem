import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error-handler";

export class OrderController {
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({
        status: "success",
        data: {
          message: "createOrder",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      res.json({
        status: "success",
        data: {
          message: "getOrder",
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
