import { Connection } from "mongoose";
import { EventEmitter } from "events";
import { dbManager } from "./connection-manager";

export class MongoDBConnection extends EventEmitter {
  private readonly connectionName: string;
  private readonly maxRetries: number = 5;
  private retryCount: number = 0;
  private readonly retryInterval: number = 5000;

  constructor(connectionName: string) {
    super();
    this.connectionName = connectionName;
  }

  public getConnection(): Connection {
    return this.connectionName === "Write"
      ? dbManager.getWriteConnection()
      : dbManager.getReadConnection();
  }

  public isConnected(): boolean {
    try {
      const connection = this.getConnection();
      return connection?.readyState === 1;
    } catch {
      return false;
    }
  }
}

class DatabaseConnections {
  private static instance: DatabaseConnections;
  private readonly writeConnection: MongoDBConnection;
  private readonly readConnection: MongoDBConnection;

  private constructor() {
    this.writeConnection = new MongoDBConnection("Write");
    this.readConnection = new MongoDBConnection("Read");
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
    await dbManager.initializeConnections();
  }
}

export const dbConnections = DatabaseConnections.getInstance();
