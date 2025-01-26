import { Collection, MongoClient } from "mongodb";

export interface ProductReadModel {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductReadRepository {
  private collection: Collection<ProductReadModel>;

  constructor() {
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://localhost:27017",
    );
    const db = client.db("product_read_db");
    this.collection = db.collection<ProductReadModel>("products");
  }

  async create(product: ProductReadModel): Promise<void> {
    await this.collection.insertOne(product);
  }

  async update(id: string, product: Partial<ProductReadModel>): Promise<void> {
    await this.collection.updateOne(
      { id },
      {
        $set: {
          ...product,
          updatedAt: new Date(),
        },
      },
    );
  }

  async updateStock(id: string, quantityChange: number): Promise<void> {
    await this.collection.updateOne(
      { id },
      {
        $inc: { stock: quantityChange },
        $set: { updatedAt: new Date() },
      },
    );
  }

  async findById(id: string): Promise<ProductReadModel | null> {
    return this.collection.findOne({ id });
  }

  async findAll(): Promise<ProductReadModel[]> {
    return this.collection.find().toArray();
  }
}
