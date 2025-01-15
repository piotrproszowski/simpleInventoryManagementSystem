import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { validate } from "../middleware/validation";
import { createOrderSchema, getOrderSchema } from "../validation/order.schema";

const route = Router();

route.post("/", validate(createOrderSchema), OrderController.createOrder);

route.get("/:id", validate(getOrderSchema), OrderController.getOrder);

export default route;
