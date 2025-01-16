import amqp, { Channel, Connection } from "amqplib";
import { Logger } from "../../shared/logger";

export class RabbitMQConnection {
  private connection?: Connection;
  private channel?: Channel;
  private readonly logger = new Logger(RabbitMQConnection.name);

  async connect(url: string): Promise<void> {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.info("Connected to RabbitMQ");
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: any,
  ): Promise<void> {
    if (!this.channel) throw new Error("RabbitMQ channel not initialized");

    await this.channel.assertExchange(exchange, "topic", { durable: true });
    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(message)),
    );
  }

  async subscribe(
    exchange: string,
    queue: string,
    routingKey: string,
    handler: (message: any) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) throw new Error("RabbitMQ channel not initialized");

    await this.channel.assertExchange(exchange, "topic", { durable: true });
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);

    this.channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content);
        this.channel?.ack(msg);
      } catch (error) {
        this.logger.error("Error processing message:", error);
        this.channel?.nack(msg);
      }
    });
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}

export const rabbitMQ = new RabbitMQConnection();
