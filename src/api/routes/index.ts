import { Router } from "express";
import products from "./product.routes";
import orders from "./order.routes";

const router = Router();

router.use("/products", products);
router.use("/orders", orders);

export default router;
