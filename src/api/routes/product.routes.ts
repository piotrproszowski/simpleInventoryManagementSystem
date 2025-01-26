import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import {
  validate,
  ValidationOptions,
} from "../../shared/validation/middleware/validate";
import {
  createProductSchema,
  updateStockSchema,
  productIdSchema,
} from "../../shared/validation/schemas/product.schema";
import { ProductCommandHandler } from "../../write/handlers/product.command-handler";
import { ProductQueryHandler } from "../../read/handlers/product.handler";
import { EventStore } from "../../write/event-store/event.store";
import { ProductRepository } from "../../read/repository/product.repository";

const router = Router();

// Initialize dependencies
const eventStore = new EventStore();
const repository = new ProductRepository();
const commandHandler = new ProductCommandHandler(eventStore);
const queryHandler = new ProductQueryHandler(repository);
const controller = new ProductController(commandHandler, queryHandler);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get(
  "/:id",
  validate(productIdSchema, { source: "params" }),
  controller.getById,
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProduct'
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
router.post("/", validate(createProductSchema), controller.create);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   post:
 *     summary: Update product stock
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStock'
 *     responses:
 *       200:
 *         description: Stock updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
router.post(
  "/:id/stock",
  validate(productIdSchema, {
    source: "params" as "body" | "query" | "params",
  }),
  validate(updateStockSchema),
  controller.updateStock,
);

export { router as productRoutes };
