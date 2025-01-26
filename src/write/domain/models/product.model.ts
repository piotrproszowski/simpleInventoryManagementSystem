import { Schema, Document } from "mongoose";
import { dbManager } from "../../../infrastructure/database/connection-manager";
import { IdGenerator } from "../../../shared/utils/id-generator";
import { BaseModel } from "./base.model";

export interface IProduct extends BaseModel {
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    _id: {
      type: String,
      default: () => IdGenerator.generate(),
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [50, "Description cannot exceed 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be greater than 0"],
    },
    stock: {
      type: Number,
      required: [true, "Product stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: "version",
    _id: false,
    id: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

productSchema.virtual("id").get(function () {
  return this._id;
});

export const ProductModel = dbManager
  .getWriteConnection()
  .model<IProduct>("Product", productSchema);

export type CreateProductDTO = Omit<IProduct, keyof BaseModel>;

export type UpdateProductDTO = Partial<CreateProductDTO>;
