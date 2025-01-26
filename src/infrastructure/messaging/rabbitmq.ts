import amqp, { Channel, Connection } from "amqplib";
import { config } from "../config";
import { Logger } from "../../shared/logger";

class RabbitMQConnection {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly logger = new Logger(RabbitMQConnection.name);

  async initialize(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.rabbitmq.uri);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(config.rabbitmq.exchange, "topic", {
        durable: true,
      });

      this.logger.info("RabbitMQ connection established");
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.initialize();
    }
    if (!this.channel) {
      throw new Error("RabbitMQ channel not initialized");
    }
    return this.channel;
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

export const rabbitMQ = new RabbitMQConnection();
