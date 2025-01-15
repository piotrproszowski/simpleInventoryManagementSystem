import { EntityId } from "../../shared/utils/id-generator";
import { BaseModel } from "../domain/models/base.model";

export interface IBaseRepository<T extends BaseModel> {
  findById(id: EntityId): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter: Partial<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: EntityId, data: Partial<T>): Promise<T | null>;
  delete(id: EntityId): Promise<boolean>;
  exists(id: EntityId): Promise<boolean>;
}

export abstract class BaseRepository<T extends BaseModel>
  implements IBaseRepository<T>
{
  constructor(protected readonly model: any) {}

  async findById(id: EntityId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findMany(filter: Partial<T>): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return entity.save();
  }

  async update(id: EntityId, data: Partial<T>): Promise<T | null> {
    const options = { new: true, runValidators: true };
    return this.model.findByIdAndUpdate(id, data, options).exec();
  }

  async delete(id: EntityId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async exists(id: EntityId): Promise<boolean> {
    const result = await this.model.exists({ _id: id });
    return !!result;
  }
}
