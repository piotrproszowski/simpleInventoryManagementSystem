import mongoose, { Connection } from "mongoose";
import config from "../config";
import { EventEmitter } from "events";

export class DatabaseConnectionManager extends EventEmitter {
  private static instance: DatabaseConnectionManager;
  private writeConnection: Connection | null = null;
  private readConnection: Connection | null = null;

  private constructor() {
    super();
    this.handleProcessTermination();
  }

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  private getConnectionOptions() {
    return {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    };
  }

  public async initializeConnections(): Promise<void> {
    try {
      if (!config.mongodb.writeUri || !config.mongodb.readUri) {
        throw new Error("MongoDB URIs not provided");
      }

      [this.writeConnection, this.readConnection] = await Promise.all([
        this.createConnection(config.mongodb.writeUri, "Write"),
        this.createConnection(config.mongodb.readUri, "Read"),
      ]);

      this.emit("connected");
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  private async createConnection(
    uri: string,
    name: string,
  ): Promise<Connection> {
    try {
      const connection = await mongoose.createConnection(
        uri,
        this.getConnectionOptions(),
      );

      connection.on("error", (error) => {
        console.error(`${name} DB Error:`, error);
        this.emit("error", error);
      });

      connection.on("disconnected", () => {
        console.warn(`${name} DB disconnected. Attempting to reconnect...`);
        this.emit("disconnected", name);
      });

      console.log(`${name} database connected successfully`);
      return connection;
    } catch (error) {
      console.error(`${name} DB Connection Error:`, error);
      throw error;
    }
  }

  private handleProcessTermination(): void {
    const closeConnections = async () => {
      try {
        await Promise.all([
          this.writeConnection?.close(),
          this.readConnection?.close(),
        ]);
        console.log("Database connections closed.");
        process.exit(0);
      } catch (error) {
        console.error("Error closing database connections:", error);
        process.exit(1);
      }
    };

    process.on("SIGINT", closeConnections);
    process.on("SIGTERM", closeConnections);
  }

  public getWriteConnection(): Connection {
    if (!this.writeConnection) {
      throw new Error("Write connection not initialized");
    }
    return this.writeConnection;
  }

  public getReadConnection(): Connection {
    if (!this.readConnection) {
      throw new Error("Read connection not initialized");
    }
    return this.readConnection;
  }
}

export const dbManager = DatabaseConnectionManager.getInstance();
