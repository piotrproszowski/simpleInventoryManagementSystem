export class ProductReadModel {
  id!: string;
  name!: string;
  description!: string;
  price!: number;
  stock!: number;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<ProductReadModel>) {
    Object.assign(this, data);
  }
}
