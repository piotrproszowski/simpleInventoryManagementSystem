import { EntityId } from "../../shared/utils/id-generator";
import { BaseRepository } from "./base.repository";
import { IProduct, ProductModel } from "../domain/models/product.model";
import { AppError } from "../../api/middleware/error-handler";

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(ProductModel);
  }

  async updateStock(id: EntityId, quantity: number): Promise<IProduct> {
    const product = await this.findById(id);

    if (!product) {
      throw new AppError(404, "Product not found");
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      throw new AppError(400, "Insufficient stock");
    }

    const updatedProduct = await this.update(id, {
      stock: newStock,
      version: product.version + 1,
    });

    if (!updatedProduct) {
      throw new AppError(409, "Product was updated by another process");
    }

    return updatedProduct;
  }

  async findByIds(ids: EntityId[]): Promise<IProduct[]> {
    return this.model.find({ _id: { $in: ids } }).exec();
  }

  async checkStockAvailability(
    products: Array<{ productId: EntityId; quantity: number }>,
  ): Promise<{
    success: boolean;
    insufficientProducts: EntityId[];
  }> {
    const productIds = products.map((p) => p.productId);
    const existingProducts = await this.findByIds(productIds);

    const productMap = new Map(
      existingProducts.map((product) => [product.id, product]),
    );

    const insufficientProducts: EntityId[] = [];

    products.forEach(({ productId, quantity }) => {
      const product = productMap.get(productId);
      if (!product || product.stock < quantity) {
        insufficientProducts.push(productId);
      }
    });

    return {
      success: insufficientProducts.length === 0,
      insufficientProducts,
    };
  }

  async bulkUpdateStock(
    updates: Array<{ productId: EntityId; quantity: number }>,
  ): Promise<void> {
    const session = await this.model.startSession();

    try {
      await session.withTransaction(async () => {
        for (const update of updates) {
          const product = await this.findById(update.productId);

          if (!product) {
            throw new AppError(404, `Product not found: ${update.productId}`);
          }

          const newStock = product.stock + update.quantity;

          if (newStock < 0) {
            throw new AppError(
              400,
              `Insufficient stock for product: ${update.productId}`,
            );
          }

          const updatedProduct = await this.update(update.productId, {
            stock: newStock,
            version: product.version + 1,
          });

          if (!updatedProduct) {
            throw new AppError(
              409,
              `Concurrent modification detected for product: ${update.productId}`,
            );
          }
        }
      });
    } finally {
      session.endSession();
    }
  }
}

export const productRepository = new ProductRepository();
