import express from "express";
import dotenv from "dotenv";
import { rabbitMQ } from "./infrastructure/messaging/rabbitmq";
import { dbConnections } from "./infrastructure/database/mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    await dbConnections.initialize();
    await rabbitMQ.initialize();

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  process.exit(1);
});
