import { rabbitMQ } from "../../infrastructure/messaging/rabbitmq";
import { IdGenerator } from "../../shared/utils/id-generator";
import { BaseEvent } from "./events";

export class EventEmitter {
  private static instance: EventEmitter;

  private constructor() {}

  public static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  async emit<T extends BaseEvent>(
    eventType: string,
    routingKey: string,
    data: Omit<T, "id" | "timestamp" | "version">,
  ): Promise<void> {
    const event: BaseEvent = {
      id: IdGenerator.generate(),
      timestamp: new Date(),
      version: 1,
      ...data,
    };

    try {
      await rabbitMQ.publish(routingKey, {
        ...event,
        eventType,
      });
    } catch (error) {
      console.error(`Failed to emit event ${eventType}:`, error);
      throw error;
    }
  }
}

export const eventEmitter = EventEmitter.getInstance();
