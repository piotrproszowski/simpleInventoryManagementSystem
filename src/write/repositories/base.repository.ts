import { EntityId, IdGenerator } from "../../shared/utils/id-generator";
import { BaseModel } from "../domain/models/base.model";
import { FilterQuery, Model, QueryOptions } from "mongoose";

export interface IBaseRepository<T extends BaseModel> {
  findById(id: EntityId): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  findMany(filter: FilterQuery<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: EntityId, data: Partial<T>): Promise<T | null>;
  delete(id: EntityId): Promise<boolean>;
  exists(id: EntityId): Promise<boolean>;
}

export abstract class BaseRepository<T extends BaseModel>
  implements IBaseRepository<T>
{
  constructor(protected readonly model: Model<T>) {}

  async findById(id: EntityId): Promise<T | null> {
    const result = await this.model.findById(id).lean();
    return result as T | null;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const result = await this.model.findOne(filter).lean();
    return result as T | null;
  }

  async findMany(filter: FilterQuery<T>): Promise<T[]> {
    const results = await this.model.find(filter).lean();
    return results as T[];
  }

  async create(data: Partial<T>): Promise<T> {
    const entityData = {
      ...data,
      _id: data._id || IdGenerator.generate(),
    };
    const entity = await this.model.create(entityData);
    return entity.toObject() as T;
  }

  async update(id: EntityId, data: Partial<T>): Promise<T | null> {
    const options: QueryOptions = { new: true, runValidators: true };
    const result = await this.model
      .findByIdAndUpdate(id, data as any, options)
      .lean();
    return result as T | null;
  }

  async delete(id: EntityId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).lean();
    return !!result;
  }

  async exists(id: EntityId): Promise<boolean> {
    const result = await this.model.exists({ _id: id });
    return !!result;
  }
}
