import { Schema, model } from "mongoose";
import { BaseModel, BaseEvent } from "./base.model";
import { IdGenerator, EntityId } from "../../../shared/utils/id-generator";

export interface IProduct extends BaseModel {
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface ProductCreatedEvent extends BaseEvent {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface StockUpdatedEvent extends BaseEvent {
  productId: EntityId;
  previousStock: number;
  currentStock: number;
  adjustment: number;
}

const productSchema = new Schema<IProduct>(
  {
    _id: {
      type: String,
      default: () => IdGenerator.generate(),
      validate: {
        validator: (v: string) => IdGenerator.isValid(v),
        message: "Invalid UUID format",
      },
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
  },
);

productSchema.index({ name: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

productSchema.pre("save", function (next) {
  if (this.stock < 0) {
    next(new Error("Stock cannot be negative"));
  }
  if (!this._id) {
    this._id = IdGenerator.generate();
  }
  next();
});

productSchema.virtual("id").get(function () {
  return this._id;
});

export const ProductModel = model<IProduct>("Product", productSchema);
