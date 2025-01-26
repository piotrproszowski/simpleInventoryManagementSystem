import request from "supertest";
import { app } from "../../index";
import { mongodb } from "../../infrastructure/database/mongodb";
import { ProductReadModel } from "../../read/model/product.read-model";

describe("Product API Integration Tests", () => {
  beforeAll(async () => {
    await mongodb.connect();
  });

  afterAll(async () => {
    await mongodb.close();
  });

  beforeEach(async () => {
    const collection = mongodb.getReadDb().collection("products");
    await collection.deleteMany({});
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const response = await request(app).post("/api/products").send({
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
        stock: 10,
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");

      const product = await mongodb
        .getReadDb()
        .collection<ProductReadModel>("products")
        .findOne({ id: response.body.id });

      expect(product).toBeTruthy();
      expect(product?.name).toBe("Test Product");
    });
  });
});
