import { DomainEvent } from "../../shared/domain/domain.event";
import { Logger } from "../../shared/logger";
import { mongodb } from "../../infrastructure/database/mongodb";
import { Collection } from "mongodb";

export class EventStore {
  private readonly collection: Collection;
  private readonly logger = new Logger(EventStore.name);

  constructor() {
    this.collection = mongodb.getWriteDb().collection("events");
  }

  async save(events: DomainEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const eventDocuments = events.map((event) => ({
        aggregateId: event.aggregateId,
        type: event.type,
        data: event,
        occurredAt: event.occurredAt,
      }));

      await this.collection.insertMany(eventDocuments);
      this.logger.info(`Saved ${events.length} events to store`);
    } catch (error) {
      this.logger.error("Failed to save events:", error);
      throw error;
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    try {
      const documents = await this.collection
        .find({ aggregateId })
        .sort({ occurredAt: 1 })
        .toArray();

      return documents.map((doc) => doc.data);
    } catch (error) {
      this.logger.error(
        `Failed to get events for aggregate ${aggregateId}:`,
        error,
      );
      throw error;
    }
  }
}
