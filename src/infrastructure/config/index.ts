import dotenv from "dotenv";
import { Config } from "./types";
dotenv.config();

const config: Config = {
  mongodb: {
    writeUri:
      `mongodb://${process.env.MONGO_WRITE_USER}:${process.env.MONGO_WRITE_PASSWORD}@localhost:${process.env.MONGO_WRITE_PORT}/${process.env.MONGO_WRITE_DB}?authSource=admin` ||
      "",
    readUri:
      `mongodb://${process.env.MONGO_READ_USER}:${process.env.MONGO_READ_PASSWORD}@localhost:${process.env.MONGO_READ_PORT}/${process.env.MONGO_READ_DB}?authSource=admin` ||
      "",
  },
};

export default config;
