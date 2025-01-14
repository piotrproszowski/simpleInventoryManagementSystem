import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error-handler";

export class ProductController {
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    res.status(201).json({ message: "Product created" });
  }

  static async restockProduct(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({ message: "Product restocked" });
  }

  static async sellProduct(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({ message: "Product sold" });
  }
}
