import { ProductReadModel } from "../model/product.model";

export type ProductEvent = {
  type:
    | "ProductCreated"
    | "ProductUpdated"
    | "ProductStockIncreased"
    | "ProductStockDecreased";
  data: ProductReadModel & { quantity?: number };
};
