import dotenv from "dotenv";
import { Config } from "./types";
import Joi from "joi";
dotenv.config();

const envSchema = Joi.object({
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().required(),

  MONGO_WRITE_USER: Joi.string().required(),
  MONGO_WRITE_PASSWORD: Joi.string().required(),
  MONGO_WRITE_DB: Joi.string().required(),

  MONGO_READ_USER: Joi.string().required(),
  MONGO_READ_PASSWORD: Joi.string().required(),
  MONGO_READ_DB: Joi.string().required(),

  RABBITMQ_USER: Joi.string().required(),
  RABBITMQ_PASSWORD: Joi.string().required(),
  RABBITMQ_PORT: Joi.number().required(),
  RABBITMQ_EXCHANGE: Joi.string().default("inventory_events"),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

process.env = { ...process.env, ...envVars };

const config: Config = {
  mongodb: {
    writeUri:
      `mongodb://${process.env.MONGO_WRITE_USER}:${process.env.MONGO_WRITE_PASSWORD}@mongodb-write:27017/${process.env.MONGO_WRITE_DB}?authSource=admin` ||
      "",
    readUri:
      `mongodb://${process.env.MONGO_READ_USER}:${process.env.MONGO_READ_PASSWORD}@mongodb-read:27017/${process.env.MONGO_READ_DB}?authSource=admin` ||
      "",
  },

  rabbitmq: {
    url:
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@rabbitmq:${process.env.RABBITMQ_PORT}` ||
      "",
    exchangeName: process.env.RABBITMQ_EXCHANGE || "inventory_events",
  },
};

export default config;
