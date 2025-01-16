import { BaseRepository } from "../../shared/database/repository.base";
import { ProductReadModel } from "../model/product.read-model";
import { mongodb } from "../../infrastructure/database/mongodb";

export class ProductRepository extends BaseRepository<ProductReadModel> {
  constructor() {
    super(mongodb.getReadDb(), "products");
  }

  async save(product: ProductReadModel): Promise<void> {
    await this.create(product);
  }

  async updateStock(
    id: string,
    quantity: number,
    updatedAt: Date,
  ): Promise<void> {
    await this.update(id, { stock: quantity, updatedAt });
  }
}
