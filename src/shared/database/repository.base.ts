import {
  Collection,
  Db,
  Filter,
  OptionalUnlessRequiredId,
  WithId,
} from "mongodb";
import { Logger } from "../logger";

export abstract class BaseRepository<T extends { id: string }> {
  protected readonly collection: Collection<T>;
  protected readonly logger: Logger;

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
    this.logger = new Logger(this.constructor.name);
  }

  async findById(id: string): Promise<T | null> {
    try {
      const filter: Filter<T> = { id } as Filter<T>;
      const doc = await this.collection.findOne(filter);
      return doc ? this.mapToModel(doc) : null;
    } catch (error) {
      this.logger.error(`Error finding document by id ${id}:`, error);
      throw error;
    }
  }

  private mapToModel(doc: WithId<T>): T {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, id, ...rest } = doc;
    return { id: _id.toString(), ...rest } as unknown as T;
  }

  async findByIds(ids: string[]): Promise<T[]> {
    try {
      const filter: Filter<T> = { id: { $in: ids } } as Filter<T>;
      const docs = await this.collection.find(filter).toArray();
      return docs.map(this.mapToModel);
    } catch (error) {
      this.logger.error("Error finding documents by ids:", error);
      throw error;
    }
  }

  async findAll(skip = 0, limit = 10): Promise<T[]> {
    try {
      const docs = await this.collection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      return docs.map(this.mapToModel);
    } catch (error) {
      this.logger.error("Error finding all documents:", error);
      throw error;
    }
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    try {
      return await this.collection.countDocuments(filter);
    } catch (error) {
      this.logger.error("Error counting documents:", error);
      throw error;
    }
  }

  protected async create(entity: T): Promise<void> {
    try {
      const { id, ...rest } = entity;
      await this.collection.insertOne({
        _id: id,
        ...rest,
      } as OptionalUnlessRequiredId<T>);
      this.logger.debug(`Created document with id ${entity.id}`);
    } catch (error) {
      this.logger.error("Error creating document:", error);
      throw error;
    }
  }

  protected async update(id: string, entity: Partial<T>): Promise<void> {
    try {
      const filter: Filter<T> = { id } as Filter<T>;
      const result = await this.collection.updateOne(filter, {
        $set: { ...entity, updatedAt: new Date() },
      });

      if (!result.matchedCount) {
        this.logger.warn(`No document found with id ${id} for update`);
      }
    } catch (error) {
      this.logger.error(`Error updating document ${id}:`, error);
      throw error;
    }
  }

  protected async delete(id: string): Promise<void> {
    try {
      const filter: Filter<T> = { id } as Filter<T>;
      const result = await this.collection.deleteOne(filter);

      if (!result.deletedCount) {
        this.logger.warn(`No document found with id ${id} for deletion`);
      }
    } catch (error) {
      this.logger.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
}
