import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validate } from "../middleware/validation";
import {
  createProductSchema,
  updateStockSchema,
} from "../validation/product.schema";

const route = Router();

route.post("/", validate(createProductSchema), ProductController.createProduct);

route.post(
  "/:id/restock",
  validate(updateStockSchema),
  ProductController.restockProduct,
);

route.post(
  "/:id/sell",
  validate(updateStockSchema),
  ProductController.sellProduct,
);

export default route;
