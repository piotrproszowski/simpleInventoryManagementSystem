import { config } from "./infrastructure/config";
import { app } from "./api/app";
import { Logger } from "./shared/logger";
import { mongodb } from "./infrastructure/database/mongodb";

const logger = new Logger("Server");

async function startServer() {
  try {
    await mongodb.connect();
    logger.info("Connected to MongoDB");

    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();

  process.on("SIGTERM", async () => {
    logger.info("SIGTERM received. Shutting down gracefully");
    await mongodb.close();
    process.exit(0);
  });
}

export { app };
