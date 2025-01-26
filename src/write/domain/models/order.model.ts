import { Schema } from "mongoose";
import { dbManager } from "../../../infrastructure/database/connection-manager";
import { EntityId, IdGenerator } from "../../../shared/utils/id-generator";
import { BaseEvent, BaseModel } from "./base.model";

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

interface OrderProduct {
  productId: EntityId;
  quantity: number;
  price: number;
}

export interface IOrder extends BaseModel {
  customerId: EntityId;
  products: OrderProduct[];
  status: OrderStatus;
  totalAmount: number;
}

export interface OrderCreatedEvent extends BaseEvent {
  customerId: EntityId;
  products: OrderProduct[];
  totalAmount: number;
}

export interface OrderStatusUpdatedEvent extends BaseEvent {
  orderId: EntityId;
  previousStatus: OrderStatus;
  currentStatus: OrderStatus;
}

const orderProductSchema = new Schema<OrderProduct>(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      validate: {
        validator: (v: string) => IdGenerator.isValid(v),
        message: "Invalid product UUID format",
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than 0"],
    },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    _id: {
      type: String,
      default: () => IdGenerator.generate(),
      validate: {
        validator: (v: string) => IdGenerator.isValid(v),
        message: "Invalid UUID format",
      },
    },
    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
      validate: {
        validator: (v: string) => IdGenerator.isValid(v),
        message: "Invalid customer UUID format",
      },
      index: true,
    },
    products: {
      type: [orderProductSchema],
      required: [true, "Order must contain at least one product"],
      validate: {
        validator: (products: OrderProduct[]) => products.length > 0,
        message: "Order must contain at least one product",
      },
    },
    status: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PENDING,
      required: [true, "Order status is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount must be greater than 0"],
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
export const OrderModel = dbManager
  .getWriteConnection()
  .model<IOrder>("Order", orderSchema);
