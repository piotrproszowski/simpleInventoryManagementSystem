import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { config } from "../infrastructure/config";
import { productRoutes } from "./routes/product.routes";
import { errorHandler } from "./middleware/error-handler";
import { Logger } from "../shared/logger";
import { swaggerSpec } from "./swagger/config";

export class Server {
  private app = express();
  private readonly logger = new Logger(Server.name);

  constructor() {
    this.setupMiddleware();
    this.setupSwagger();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
  }

  private setupSwagger(): void {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  private setupRoutes(): void {
    this.app.use("/api/products", productRoutes);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    try {
      this.app.listen(config.port, () => {
        this.logger.info(`Server is running on port ${config.port}`);
      });
    } catch (error) {
      this.logger.error("Failed to start server:", error);
      throw error;
    }
  }
}
