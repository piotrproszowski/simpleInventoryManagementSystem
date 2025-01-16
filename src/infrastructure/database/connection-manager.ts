import mongoose, { Connection } from "mongoose";
import { config } from "../config";
import { Logger } from "../../shared/logger";

export class DatabaseConnection {
  private connection?: Connection;
  private readonly logger = new Logger(DatabaseConnection.name);

  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.mongodb.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.connection = mongoose.connection;
      this.logger.info("Connected to MongoDB");

      this.setupErrorHandlers();
    } catch (error) {
      this.logger.error("MongoDB connection error:", error);
      throw error;
    }
  }

  private setupErrorHandlers(): void {
    this.connection?.on("error", (error: Error) => {
      this.logger.error("MongoDB error:", error);
    });

    this.connection?.on("disconnected", () => {
      this.logger.warn("MongoDB disconnected");
    });
  }

  async close(): Promise<void> {
    await mongoose.disconnect();
  }
}

export const mongodb = new DatabaseConnection();
