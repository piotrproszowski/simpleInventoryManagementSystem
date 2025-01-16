import { Collection } from "mongodb";
import { DomainEvent } from "../../shared/domain/domain.event";
import { mongodb } from "../../infrastructure/database/mongodb";
import { Logger } from "../../shared/logger";
import { StoredEvent, EventStore } from "./types/stored-event.type";
import { v4 as uuidv4 } from "uuid";

export class MongoEventStore implements EventStore {
  private readonly collection: Collection<StoredEvent>;
  private readonly logger = new Logger(MongoEventStore.name);

  constructor() {
    this.collection = mongodb.getWriteDb().collection<StoredEvent>("events");
  }

  async initialize(): Promise<void> {
    try {
      await this.collection.createIndex({ aggregateId: 1 });
      await this.collection.createIndex({ type: 1 });
      await this.collection.createIndex({ "metadata.timestamp": 1 });
      this.logger.info("Event store initialized");
    } catch (error) {
      this.logger.error("Failed to initialize event store:", error);
      throw error;
    }
  }

  async save(events: DomainEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const storedEvents = events.map(this.mapToStoredEvent);
      await this.collection.insertMany(storedEvents);

      this.logger.info(
        `Saved ${events.length} events for aggregate ${events[0].aggregateId}`,
      );
    } catch (error) {
      this.logger.error("Failed to save events:", error);
      throw error;
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    try {
      const storedEvents = await this.collection
        .find({ aggregateId })
        .sort({ "metadata.timestamp": 1 })
        .toArray();

      return storedEvents.map(this.mapToDomainEvent);
    } catch (error) {
      this.logger.error(
        `Failed to get events for aggregate ${aggregateId}:`,
        error,
      );
      throw error;
    }
  }

  async getEventsByType(type: string): Promise<DomainEvent[]> {
    try {
      const storedEvents = await this.collection
        .find({ type })
        .sort({ "metadata.timestamp": 1 })
        .toArray();

      return storedEvents.map(this.mapToDomainEvent);
    } catch (error) {
      this.logger.error(`Failed to get events of type ${type}:`, error);
      throw error;
    }
  }

  private mapToStoredEvent(event: DomainEvent): StoredEvent {
    return {
      id: uuidv4(),
      aggregateId: event.aggregateId,
      aggregateType: event.constructor.name.replace("Event", ""),
      type: event.type,
      version: 1, // Implement versioning if needed
      data: event as unknown as Record<string, unknown>,
      metadata: {
        timestamp: event.occurredAt,
      },
    };
  }

  private mapToDomainEvent(storedEvent: StoredEvent): DomainEvent {
    return storedEvent.data as unknown as DomainEvent;
  }
}
