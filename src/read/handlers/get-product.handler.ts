import { ProductReadModel } from "../model/product.read-model";
import { ProductRepository } from "../repository/product.repository";

export class ProductQueryHandler {
  constructor(private readonly repository: ProductRepository) {}

  async getById(id: string): Promise<ProductReadModel | null> {
    return this.repository.findById(id);
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: ProductReadModel[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.repository.findAll(skip, limit),
      this.repository.count(),
    ]);
    return { items, total };
  }

  async getByIds(ids: string[]): Promise<ProductReadModel[]> {
    return this.repository.findByIds(ids);
  }
}
