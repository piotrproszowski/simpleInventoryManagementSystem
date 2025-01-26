import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongodb: {
    write: {
      uri: process.env.MONGODB_WRITE_URI || "mongodb://localhost:27017",
      database: "inventory_write",
    },
    read: {
      uri: process.env.MONGODB_READ_URI || "mongodb://localhost:27018",
      database: "inventory_read",
    },
  },
  rabbitmq: {
    uri: process.env.RABBITMQ_URI || "amqp://localhost:5672",
    exchange: process.env.RABBITMQ_EXCHANGE || "inventory_events",
  },
};
