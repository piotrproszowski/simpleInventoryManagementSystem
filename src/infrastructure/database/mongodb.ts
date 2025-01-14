import mongoose, { Connection, ConnectOptions } from "mongoose";
import { EventEmitter } from "events";
import config from "../config";

export class MongoDBConnection extends EventEmitter {
  private connection: Connection | null = null;
  private readonly uri: string;
  private readonly options: ConnectOptions;
  private readonly maxRetries: number = 5;
  private retryCount: number = 0;
  private readonly retryInterval: number = 5000;
  private isConnecting: boolean = false;
  private readonly connectionName: string;

  constructor(uri: string, connectionName: string) {
    super();
    this.uri = uri;
    this.connectionName = connectionName;
    this.options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    };

    process.on("SIGINT", this.gracefulShutdown.bind(this));
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
  }

  public async initialize(): Promise<void> {
    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      await this.connect();
      this.retryCount = 0;
      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.error(
          `MongoDB ${this.connectionName} connection attempt ${this.retryCount} failed. Retrying in ${this.retryInterval}ms...`,
        );
        setTimeout(() => this.initialize(), this.retryInterval);
      } else {
        console.error(
          `Max retry attempts reached. Failed to connect to MongoDB ${this.connectionName}.`,
        );
        this.emit("error", error);
        throw error;
      }
    }
  }

  private async connect(): Promise<void> {
    try {
      this.connection = await mongoose
        .createConnection(this.uri, this.options)
        .asPromise();

      console.log(`Connected to MongoDB ${this.connectionName}`);

      this.connection.on("error", (error) => {
        console.error(
          `MongoDB ${this.connectionName} connection error:`,
          error,
        );
        this.emit("error", error);
      });

      this.connection.on("disconnected", () => {
        console.warn(
          `MongoDB ${this.connectionName} disconnected. Attempting to reconnect...`,
        );
        setTimeout(() => this.initialize(), this.retryInterval);
      });

      this.connection.on("connected", () => {
        console.log(`MongoDB ${this.connectionName} connected`);
        this.emit("connected");
      });

      this.emit("connected");
    } catch (error) {
      console.error(
        `Error connecting to MongoDB ${this.connectionName}:`,
        error,
      );
      throw error;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log(
      `Gracefully shutting down MongoDB ${this.connectionName} connection...`,
    );

    try {
      if (this.connection) {
        await this.connection.close(true);
        console.log(`MongoDB ${this.connectionName} connection closed`);
      }
    } catch (error) {
      console.error(
        `Error during ${this.connectionName} graceful shutdown:`,
        error,
      );
    }
  }

  public getConnection(): Connection | null {
    return this.connection;
  }

  public isConnected(): boolean {
    return this.connection?.readyState === 1;
  }
}

class DatabaseConnections {
  private static instance: DatabaseConnections;
  private readonly writeConnection: MongoDBConnection;
  private readonly readConnection: MongoDBConnection;

  private constructor() {
    const writeUri = config.mongodb.writeUri || "";
    const readUri = config.mongodb.readUri || "";

    this.writeConnection = new MongoDBConnection(writeUri, "Write");
    this.readConnection = new MongoDBConnection(readUri, "Read");
  }

  public static getInstance(): DatabaseConnections {
    if (!DatabaseConnections.instance) {
      DatabaseConnections.instance = new DatabaseConnections();
    }
    return DatabaseConnections.instance;
  }

  public getWriteConnection(): MongoDBConnection {
    return this.writeConnection;
  }

  public getReadConnection(): MongoDBConnection {
    return this.readConnection;
  }

  public async initialize(): Promise<void> {
    await Promise.all([
      this.writeConnection.initialize(),
      this.readConnection.initialize(),
    ]);
  }
}

export const dbConnections = DatabaseConnections.getInstance();
