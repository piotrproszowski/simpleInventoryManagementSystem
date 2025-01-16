import express from "express";
import cors from "cors";
import helmet from "helmet";
import { productRoutes } from "./routes/product.routes";
import { errorHandler } from "./middleware/error.handler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/config";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use(errorHandler);

export { app };
