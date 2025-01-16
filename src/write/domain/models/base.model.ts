import { Schema, model, Document, Model } from "mongoose";

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseModel<T extends BaseDocument> extends Model<T> {
  findByIdOrThrow(id: string): Promise<T>;
}

export const baseSchema = new Schema(
  {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);
