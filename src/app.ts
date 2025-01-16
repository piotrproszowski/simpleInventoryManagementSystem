// src/app.ts
import express, { Express } from "express";
import { dbManager } from "./infrastructure/database/connection-manager";
import { rabbitMQ } from "./infrastructure/messaging/rabbitmq";
import router from "./api/routes";

const app: Express = express();
const port = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    await dbManager.initializeConnections();

    await rabbitMQ.initialize();

    app.use(express.json());
    app.use("/api/v1", router);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();

export default app;
