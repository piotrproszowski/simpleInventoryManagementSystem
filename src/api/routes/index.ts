import { Router } from "express";
import products from "./product.routes";

const router = Router();

router.use("/products", products);

export default router;
