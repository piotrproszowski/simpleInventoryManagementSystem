import { ProductReadModel } from "../model/product.read-model";
import { ProductRepository } from "../repository/product.repository";
import { Logger } from "../../shared/logger";

export class ProductQueryHandler {
  private readonly logger = new Logger(ProductQueryHandler.name);

  constructor(private readonly repository: ProductRepository) {}

  async getById(id: string): Promise<ProductReadModel | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      this.logger.error("Error fetching product by ID:", error);
      throw error;
    }
  }

  async getAll(
    page = 1,
    limit = 10,
  ): Promise<{ items: ProductReadModel[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        this.repository.findAll(skip, limit),
        this.repository.count(),
      ]);
      return { items, total };
    } catch (error) {
      this.logger.error("Error fetching products:", error);
      throw error;
    }
  }

  async getByIds(ids: string[]): Promise<ProductReadModel[]> {
    try {
      return await this.repository.findByIds(ids);
    } catch (error) {
      this.logger.error("Error fetching products by IDs:", error);
      throw error;
    }
  }
}
