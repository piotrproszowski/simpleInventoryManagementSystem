import { Document } from "mongoose";
import { EntityId } from "../../../shared/utils/id-generator";

export interface BaseModel extends Document {
  _id: EntityId;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface BaseEvent {
  id: EntityId;
  aggregateId: EntityId;
  timestamp: Date;
  version: number;
  eventType: string;
}

export interface BaseAggregate {
  id: EntityId;
  version: number;
}

export type AggregateId = EntityId;
export type EventId = EntityId;
