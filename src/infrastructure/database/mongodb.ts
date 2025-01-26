import { MongoClient, Db } from "mongodb";
import { config } from "../config";
import { Logger } from "../../shared/logger";

export class MongoDB {
  private writeClient: MongoClient | null = null;
  private readClient: MongoClient | null = null;
  private writeDb: Db | null = null;
  private readDb: Db | null = null;
  private readonly logger = new Logger(MongoDB.name);

  async connect(): Promise<void> {
    try {
      this.writeClient = new MongoClient(config.mongodb.write.uri);
      this.readClient = new MongoClient(config.mongodb.read.uri);

      await Promise.all([
        this.writeClient.connect(),
        this.readClient.connect(),
      ]);

      this.writeDb = this.writeClient.db(config.mongodb.write.database);
      this.readDb = this.readClient.db(config.mongodb.read.database);

      this.logger.info("MongoDB connections established");
    } catch (error) {
      this.logger.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  getWriteDb(): Db {
    if (!this.writeDb) {
      throw new Error("Write MongoDB not connected");
    }
    return this.writeDb;
  }

  getReadDb(): Db {
    if (!this.readDb) {
      throw new Error("Read MongoDB not connected");
    }
    return this.readDb;
  }

  async close(): Promise<void> {
    if (this.writeClient) await this.writeClient.close();
    if (this.readClient) await this.readClient.close();
  }
}

export const mongodb = new MongoDB();
