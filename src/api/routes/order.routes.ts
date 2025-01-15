import { Router } from "express";
import { OrderController } from "../controllers/order.controller";

const route = Router();

route.post("/", OrderController.createOrder);

route.get("/:id", OrderController.getOrder);

export default route;
