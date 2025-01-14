import amqp, { Connection, Channel } from "amqplib";
import { EventEmitter } from "events";
import config from "../config";

export class RabbitMQConnection extends EventEmitter {
  private static instance: RabbitMQConnection;
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;
  private readonly exchange: string;
  private readonly maxRetries: number = 5;
  private retryCount: number = 0;
  private readonly retryInterval: number = 5000;
  private isConnecting: boolean = false;

  private constructor() {
    super();
    this.url = config.rabbitmq.url || "";
    this.exchange = config.rabbitmq.exchangeName || "inventory_events";

    process.on("SIGINT", this.gracefulShutdown.bind(this));
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
  }

  public static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
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
          `RabbitMQ connection attempt ${this.retryCount} failed. Retrying in ${this.retryInterval}ms...`,
        );
        setTimeout(() => this.initialize(), this.retryInterval);
      } else {
        console.error(
          "Max retry attempts reached. Failed to connect to RabbitMQ.",
        );
        this.emit("error", error);
        throw error;
      }
    }
  }

  private async connect(): Promise<void> {
    this.connection = await amqp.connect(this.url);
    console.log("Connected to RabbitMQ");

    this.connection.on("error", (error) => {
      console.error("RabbitMQ connection error:", error);
      this.emit("error", error);
    });

    this.connection.on("close", async () => {
      console.warn("RabbitMQ connection closed. Attempting to reconnect...");
      this.channel = null;
      setTimeout(() => this.initialize(), this.retryInterval);
    });

    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, "topic", {
      durable: true,
    });

    this.channel.on("error", (error) => {
      console.error("RabbitMQ channel error:", error);
      this.emit("error", error);
    });

    this.channel.on("close", () => {
      console.warn("RabbitMQ channel closed");
    });

    this.emit("connected");
  }

  public async publish(routingKey: string, message: unknown): Promise<void> {
    if (!this.channel) {
      throw new Error("No RabbitMQ channel available");
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      this.channel.publish(this.exchange, routingKey, buffer, {
        persistent: true,
        contentType: "application/json",
      });
    } catch (error) {
      console.error("Failed to publish message:", error);
      throw error;
    }
  }

  public async subscribe(
    queue: string,
    routingKey: string,
    handler: (message: unknown) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("No RabbitMQ channel available");
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, this.exchange, routingKey);

      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.channel?.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          this.channel?.nack(msg, false, true);
        }
      });
    } catch (error) {
      console.error("Failed to subscribe:", error);
      throw error;
    }
  }

  private async gracefulShutdown(): Promise<void> {
    console.log("Gracefully shutting down RabbitMQ connection...");

    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
    }

    process.exit(0);
  }

  public getChannel(): Channel | null {
    return this.channel;
  }
}

export const rabbitMQ = RabbitMQConnection.getInstance();
