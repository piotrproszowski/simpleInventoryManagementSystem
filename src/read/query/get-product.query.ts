import { ProductReadModel } from "../model/product.read-model";
import { ProductRepository } from "../repository/product.repository";

export class GetProductQuery {
  constructor(private readonly repository: ProductRepository) {}

  async byId(id: string): Promise<ProductReadModel | null> {
    return this.repository.findById(id);
  }

  async all(): Promise<ProductReadModel[]> {
    return this.repository.findAll();
  }
}
