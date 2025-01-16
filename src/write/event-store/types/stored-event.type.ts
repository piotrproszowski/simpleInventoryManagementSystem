import { DomainEvent } from "../../../shared/domain/domain.event";

export interface StoredEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  type: string;
  version: number;
  data: Record<string, unknown>;
  metadata: {
    timestamp: Date;
    correlationId?: string;
  };
}

export interface EventData {
  type: string;
  data: Record<string, unknown>;
}

export interface EventMetadata {
  timestamp: Date;
  correlationId?: string;
}

export interface EventStore {
  save(events: DomainEvent[]): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(type: string): Promise<DomainEvent[]>;
}
